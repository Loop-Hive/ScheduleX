import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CardInterface} from '../types/cards';

interface Registers {
  [key: number]: {
    name: string;
    cards: CardInterface[];
    card_size: string;
  };
}

interface StoreState {
  registers: Registers;
  copyRegister: number;
  activeRegister: number;
  updatedAt: Date | null;
  defaultTargetPercentage: number;
  setRegisters: (regNo: number, cardsData: CardInterface[]) => void;
  updateDate: (date: Date) => void;
  changeCopyRegister: (registerId: number) => void;
  setActiveRegister: (registerId: number) => void;
  addRegister: (registerId: number, registerName: string) => void;
  renameRegister: (registerId: number, registerName: string) => void;
  removeRegister: (registerId: number) => void;
  addCard: (registerId: number, cardData: CardInterface) => void;
  clearCardsAttendance: (registerId: number) => void;
  markPresent: (registerId: number, cardId: number) => void;
  markAbsent: (registerId: number, id: number) => void;
  markAbsentWithDate: (date: Date, cardId: number, registerId: number) => void;
  markPresentWithDate: (date: Date, cardId: number, registerId: number) => void;
  removeMarking: (
    registerId: number,
    cardId: number,
    markingId: number,
  ) => void;
  undoChanges: (registerId: number, cardId: number) => void;

  editCard: (registerId: number, card: CardInterface, cardId: number) => void;
  setRegisterCardSize: (registerId: number, inputSize: string) => void;
  removeCard: (registerId: number, cardIndex: number) => void;
}

export const useStore = create<StoreState>()(
  persist(
    set => ({
      registers: {
        0: {
          name: 'Semester VI',
          cards: [],
          card_size: 'normal',
        },
      },
      activeRegister: 0,
      copyRegister: 0,
      updatedAt: null,
      defaultTargetPercentage: 75,

      changeCopyRegister: (registerId: number) =>
        set(() => ({
          copyRegister: registerId,
        })),

      setActiveRegister: (registerId: number) =>
        set(() => ({
          activeRegister: registerId,
        })),
      setRegisters: (registerId: number, cardsData: CardInterface[]) =>
        set(state => ({
          registers: {
            ...state.registers,
            [registerId]: {
              ...state.registers[registerId],
              cards: cardsData,
            },
          },
        })),

      updateDate: (date: Date) =>
        set(() => ({
          updatedAt: date,
        })),
      addRegister: (registerId: number, registerName: string) =>
        set(state => ({
          registers: {
            ...state.registers,
            [registerId]: {
              name: registerName,
              cards: [],
              card_size: 'normal',
            },
          },
        })),

      renameRegister: (registerId: number, registerName: string) =>
        set(state => ({
          registers: {
            ...state.registers,
            [registerId]: {
              ...state.registers[registerId],
              name: registerName,
            },
          },
        })),

      clearCardsAttendance: (registerId: number) =>
        set(state => ({
          registers: {
            ...state.registers,
            [registerId]: {
              ...state.registers[registerId],
              cards: [],
            },
          },
        })),

      removeRegister: (registerId: number) =>
        set(state => {
          const registers = {...state.registers};
          if (registerId in registers) {
            const keys = Object.keys(registers)
              .map(Number)
              .sort((a, b) => a - b);
            if (registerId < keys.length - 1) {
              for (let i = registerId; i < keys.length - 1; i++) {
                registers[i] = registers[i + 1];
              }
            }
            delete registers[keys.length - 1];
            const newActiveRegister =
              state.activeRegister === registerId ? 0 : state.activeRegister;
            return {
              registers,
              activeRegister: newActiveRegister,
            };
          }
          return state;
        }),

      addCard: (registerId: number, cardData: CardInterface) =>
        set(state => ({
          registers: {
            ...state.registers,
            [registerId]: {
              ...state.registers[registerId],
              cards: [...(state.registers[registerId].cards || []), cardData],
            },
          },
          updatedAt: new Date(),
        })),
      markPresent: (registerId: number, cardId: number) =>
        set(state => ({
          registers: {
            ...state.registers,
            [registerId]: {
              ...state.registers[registerId],
              cards: state.registers[registerId].cards.map(card =>
                card.id === cardId
                  ? {
                      ...card,
                      present: card.present + 1,
                      total: card.total + 1,
                      markedAt: [
                        ...card.markedAt,
                        {
                          id: card.markedAt.length + 1,
                          date: new Date().toString(),
                          isPresent: true,
                        },
                      ],
                    }
                  : card,
              ),
            },
          },
        })),

      markAbsent: (registerId: number, cardId: number) =>
        set(state => ({
          registers: {
            ...state.registers,
            [registerId]: {
              ...state.registers[registerId],
              cards: state.registers[registerId].cards.map(card =>
                card.id === cardId
                  ? {
                      ...card,
                      total: card.total + 1,
                      markedAt: [
                        ...card.markedAt,
                        {
                          id: card.markedAt.length + 1,
                          date: new Date().toString(),
                          isPresent: false,
                        },
                      ],
                    }
                  : card,
              ),
            },
          },
        })),
      markAbsentWithDate: (date: Date, cardId: number, registerId: number) =>
        set(state => {
          const register = state.registers[registerId];
          const card = register.cards.find(
            card_temp => card_temp.id === cardId,
          );

          if (!card) {
            return state;
          }

          const newMarkedAt = [
            ...card.markedAt,
            {
              id: card.markedAt.length + 1,
              date: date.toString(),
              isPresent: false,
            },
          ];

          return {
            ...state,
            registers: {
              ...state.registers,
              [registerId]: {
                ...state.registers[registerId],
                cards: state.registers[registerId].cards.map(card_temp =>
                  card_temp.id === cardId
                    ? {
                        ...card_temp,
                        total: card_temp.total + 1,
                        markedAt: newMarkedAt,
                      }
                    : card_temp,
                ),
              },
            },
            updatedAt: new Date(),
          };
        }),
      markPresentWithDate: (date: Date, cardId: number, registerId: number) =>
        set(state => {
          const register = state.registers[registerId];
          const card = register.cards.find(
            card_temp => card_temp.id === cardId,
          );

          if (!card) {
            return state;
          }

          const newMarkedAt = [
            ...card.markedAt,
            {
              id: card.markedAt.length + 1,
              date: date.toString(),
              isPresent: true,
            },
          ];

          return {
            ...state,
            registers: {
              ...state.registers,
              [registerId]: {
                ...state.registers[registerId],
                cards: state.registers[registerId].cards.map(card_temp =>
                  card_temp.id === cardId
                    ? {
                        ...card_temp,
                        present: card_temp.present + 1,
                        total: card_temp.total + 1,
                        markedAt: newMarkedAt,
                      }
                    : card_temp,
                ),
              },
            },
            updatedAt: new Date(),
          };
        }),
      removeMarking: (registerId: number, cardId: number, markingId: number) =>
        set(state => {
          const register = state.registers[registerId];
          const card = register.cards.find(
            card_temp => card_temp.id === cardId,
          );

          if (!card) {
            return state;
          }

          // Remove the marking
          const newMarkedAt = card.markedAt
            .filter(marking => marking.id !== markingId)
            .map((marking, index) => ({
              ...marking,
              id: index + 1,
            }));

          // Update present and total
          const marking = card.markedAt.find(
            markingTemp => markingTemp.id === markingId,
          );
          const newPresent = card.present - (marking?.isPresent ? 1 : 0);
          const newTotal = card.total - 1;

          return {
            ...state,
            registers: {
              ...state.registers,
              [registerId]: {
                ...state.registers[registerId],
                cards: state.registers[registerId].cards.map(card_temp =>
                  card_temp.id === cardId
                    ? {
                        ...card_temp,
                        markedAt: newMarkedAt,
                        present: newPresent,
                        total: newTotal,
                      }
                    : card_temp,
                ),
              },
            },
            updatedAt: new Date(),
          };
        }),

      undoChanges: (registerId: number, cardId: number) =>
        set(state => {
          const register = state.registers[registerId];
          const card = register.cards.find(
            card_temp => card_temp.id === cardId,
          );

          if (!card || card.markedAt.length === 0) {
            return state;
          }

          // Remove the last markedAt object
          const newMarkedAt = card.markedAt.slice(0, -1);

          // Update present and total
          const lastMarkedAt = card.markedAt[card.markedAt.length - 1];
          const newPresent = card.present - (lastMarkedAt.isPresent ? 1 : 0);
          const newTotal = card.total - 1;

          return {
            ...state,
            registers: {
              ...state.registers,
              [registerId]: {
                ...state.registers[registerId],
                cards: state.registers[registerId].cards.map(card_temp =>
                  card_temp.id === cardId
                    ? {
                        ...card_temp,
                        markedAt: newMarkedAt,
                        present: newPresent,
                        total: newTotal,
                      }
                    : card_temp,
                ),
              },
            },
            updatedAt: new Date(),
          };
        }),

      editCard: (registerId: number, card: CardInterface, cardId: number) =>
        set(state => ({
          registers: {
            ...state.registers,
            [registerId]: {
              ...state.registers[registerId],
              cards: state.registers[registerId].cards.map(curr =>
                curr.id === cardId ? card : curr,
              ),
            },
          },
        })),

      setRegisterCardSize: (registerId: number, inputSize: string) =>
        set(state => ({
          registers: {
            ...state.registers,
            [registerId]: {
              ...state.registers[registerId],
              card_size: inputSize,
            },
          },
          updatedAt: new Date(),
        })),

      removeCard: (registerId: number, cardId: number) =>
        set(state => ({
          registers: {
            ...state.registers,
            [registerId]: {
              ...state.registers[registerId],
              cards: state.registers[registerId].cards
                .filter(card => card.id !== cardId)
                .map((card, index) => ({
                  ...card,
                  id: index,
                })),
            },
          },
          updatedAt: new Date(),
        })),
    }),
    {
      name: 'registers-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useStore;
