import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {CardInterface, AiCardInterface} from '../types/cards';
import {Tagcolors} from '../types/allCardConstraint';
import {morningSchedule} from '../constants/morning';
import {nightSchedule} from '../constants/night';

interface Registers {
  [key: number]: {
    name: string;
    cards: CardInterface[];
    card_size: string;
    color: string;
  };
}

interface StoreState {
  registers: Registers;
  copyRegister: number;
  activeRegister: number;
  updatedAt: Date | null;
  defaultTargetPercentage: number;
  selectedRegisters: number[];
  setRegisters: (regNo: number, cardsData: CardInterface[]) => void;
  updateDate: (date: Date) => void;
  setDefaultTargetPercentage: (percentage: number) => void;
  updateAllCardsTargetPercentage: (registerId: number, percentage: number) => void;
  updateAllRegistersTargetPercentage: (percentage: number) => void;
  changeCopyRegister: (registerId: number) => void;
  setActiveRegister: (registerId: number) => void;
  setSelectedRegisters: (selectedIds: number[]) => void;
  addRegister: (registerId: number, registerName: string) => void;
  renameRegister: (registerId: number, registerName: string) => void;
  removeRegister: (registerId: number) => void;
  addCard: (registerId: number, cardData: CardInterface) => void;
  clearCardsAttendance: (registerId: number) => void;
  markPresent: (registerId: number, cardId: number, timeSlot?: string) => void;
  markAbsent: (registerId: number, id: number, timeSlot?: string) => void;
  markAbsentWithDate: (date: Date, cardId: number, registerId: number, timeSlot?: string) => void;
  markPresentWithDate: (date: Date, cardId: number, registerId: number, timeSlot?: string) => void;
  removeMarking: (
    registerId: number,
    cardId: number,
    markingId: number,
  ) => void;
  undoChanges: (registerId: number, cardId: number) => void;

  editCard: (registerId: number, card: CardInterface, cardId: number) => void;
  setRegisterCardSize: (registerId: number, inputSize: string) => void;
  removeCard: (registerId: number, cardIndex: number) => void;
  addAiCard: (registerId: number, aiCard: AiCardInterface) => void;
  addMultipleAiCards: (registerId: number, aiCards: AiCardInterface[]) => void;
  setRegisterColor: (registerId: number, color: string) => void;
}

// Helper function to create default registers
const createDefaultRegisters = (): Registers => {
  // Convert morning schedule to CardInterface with proper mutable types
  const morningCards: CardInterface[] = morningSchedule.map((item, index) => ({
    id: index,
    title: item.title,
    present: item.present,
    total: item.total,
    target_percentage: item.target_percentage,
    tagColor: item.tagColor,
    days: {
      mon: [...item.days.mon],
      tue: [...item.days.tue],
      wed: [...item.days.wed],
      thu: [...item.days.thu],
      fri: [...item.days.fri],
      sat: [...item.days.sat],
      sun: [...item.days.sun],
    },
    markedAt: [...item.markedAt],
    hasLimit: item.hasLimit,
    limit: item.limit,
    limitType: item.limitType,
  }));

  // Convert night schedule to CardInterface with proper mutable types
  const nightCards: CardInterface[] = nightSchedule.map((item, index) => ({
    id: index,
    title: item.title,
    present: item.present,
    total: item.total,
    target_percentage: item.target_percentage,
    tagColor: item.tagColor,
    days: {
      mon: [...item.days.mon],
      tue: [...item.days.tue],
      wed: [...item.days.wed],
      thu: [...item.days.thu],
      fri: [...item.days.fri],
      sat: [...item.days.sat],
      sun: [...item.days.sun],
    },
    markedAt: [...item.markedAt],
    hasLimit: item.hasLimit,
    limit: item.limit,
    limitType: item.limitType,
  }));

  return {
    0: {
      name: 'Default',
      cards: [],
      card_size: 'normal',
      color: Tagcolors[0], // First color from palette
    },
    1: {
      name: 'Morning Routine',
      cards: morningCards,
      card_size: 'normal',
      color: Tagcolors[1], // Second color from palette
    },
    2: {
      name: 'Evening Routine',
      cards: nightCards,
      card_size: 'normal',
      color: Tagcolors[2], // Third color from palette
    },
  };
};

export const useStore = create<StoreState>()(
  persist(
    set => ({
      registers: createDefaultRegisters(),
      activeRegister: 0,
      copyRegister: 0,
      updatedAt: null,
      defaultTargetPercentage: 75,
      selectedRegisters: [0], // Initialize with default register

      changeCopyRegister: (registerId: number) =>
        set(() => ({
          copyRegister: registerId,
        })),

      setActiveRegister: (registerId: number) =>
        set(state => ({
          activeRegister: registerId,
          // If no registers are selected, select the new active register
          selectedRegisters: state.selectedRegisters.length === 0 ? [registerId] : state.selectedRegisters,
        })),

      setSelectedRegisters: (selectedIds: number[]) =>
        set(() => ({
          selectedRegisters: selectedIds,
        })),

      setDefaultTargetPercentage: (percentage: number) =>
        set(() => ({
          defaultTargetPercentage: percentage,
        })),

      updateAllRegistersTargetPercentage: (percentage: number) =>
        set(state => {
          const updatedRegisters = { ...state.registers };
          Object.keys(updatedRegisters).forEach(registerId => {
            const regId = parseInt(registerId);
            updatedRegisters[regId] = {
              ...updatedRegisters[regId],
              cards: updatedRegisters[regId].cards.map(card => ({
                ...card,
                target_percentage: percentage,
              })),
            };
          });

          return {
            registers: updatedRegisters,
          };
        }),

      updateAllCardsTargetPercentage: (registerId: number, percentage: number) =>
        set(state => ({
          registers: {
            ...state.registers,
            [registerId]: {
              ...state.registers[registerId],
              cards: state.registers[registerId]?.cards.map(card => ({
                ...card,
                target_percentage: percentage,
              })) || [],
            },
          },
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
        set(state => {
          const usedColors = Object.values(state.registers).map(
            reg => reg.color,
          );
          const availableColor =
            Tagcolors.find(color => !usedColors.includes(color)) ||
            Tagcolors[registerId % Tagcolors.length];

          return {
            registers: {
              ...state.registers,
              [registerId]: {
                name: registerName,
                cards: [],
                card_size: 'normal',
                color: availableColor,
              },
            },
          };
        }),

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

            // Remove the deleted register from selectedRegisters and ensure valid selection
            let newSelectedRegisters = state.selectedRegisters.filter(id => id !== registerId);
            if (newSelectedRegisters.length === 0 && Object.keys(registers).length > 0) {
              newSelectedRegisters = [newActiveRegister];
            }

            return {
              registers,
              activeRegister: newActiveRegister,
              selectedRegisters: newSelectedRegisters,
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
      markPresent: (registerId: number, cardId: number, timeSlot?: string) =>
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
                          timeSlot: timeSlot,
                        },
                      ],
                    }
                  : card,
              ),
            },
          },
        })),

      markAbsent: (registerId: number, cardId: number, timeSlot?: string) =>
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
                          timeSlot: timeSlot,
                        },
                      ],
                    }
                  : card,
              ),
            },
          },
        })),
      markAbsentWithDate: (date: Date, cardId: number, registerId: number, timeSlot?: string) =>
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
              timeSlot: timeSlot,
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
      markPresentWithDate: (date: Date, cardId: number, registerId: number, timeSlot?: string) =>
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
              timeSlot: timeSlot,
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

      addAiCard: (registerId: number, aiCard: any) =>
        set(state => {
          const currentCards = state.registers[registerId]?.cards || [];
          const newCardId =
            currentCards.length > 0
              ? Math.max(...currentCards.map(c => c.id)) + 1
              : 0;

          const cardInterface: CardInterface = {
            id: newCardId,
            title: aiCard.title,
            present: 0,
            total: 0,
            target_percentage: aiCard.target_percentage,
            tagColor: aiCard.tagColor,
            days: aiCard.days,
            markedAt: [],
            hasLimit: false,
            limit: 0,
            limitType: 'with-absent',
          };

          return {
            registers: {
              ...state.registers,
              [registerId]: {
                ...state.registers[registerId],
                cards: [...currentCards, cardInterface],
              },
            },
            updatedAt: new Date(),
          };
        }),

      addMultipleAiCards: (registerId: number, aiCards: any[]) =>
        set(state => {
          const currentCards = state.registers[registerId]?.cards || [];
          const startId =
            currentCards.length > 0
              ? Math.max(...currentCards.map(c => c.id)) + 1
              : 0;

          const newCards: CardInterface[] = aiCards.map((aiCard, index) => ({
            id: startId + index,
            title: aiCard.title,
            present: 0,
            total: 0,
            target_percentage: aiCard.target_percentage,
            tagColor: aiCard.tagColor,
            days: aiCard.days,
            markedAt: [],
            hasLimit: false,
            limit: 0,
            limitType: 'with-absent',
          }));
          console.log(newCards);

          return {
            registers: {
              ...state.registers,
              [registerId]: {
                ...state.registers[registerId],
                cards: [...currentCards, ...newCards],
              },
            },
            updatedAt: new Date(),
          };
        }),

      setRegisterColor: (registerId: number, color: string) =>
        set(state => ({
          registers: {
            ...state.registers,
            [registerId]: {
              ...state.registers[registerId],
              color: color,
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

// Debug overlay for modal visibility (for development only)
// Place this in your CustomTabBar or main screen, not in the store
// Example usage:
// <View style={{position: 'absolute', top: 40, left: 0, right: 0, zIndex: 9999, alignItems: 'center'}} pointerEvents="none">
//   <Text style={{backgroundColor: 'rgba(255,0,0,0.7)', color: '#fff', padding: 8, borderRadius: 8, fontSize: 16}}>
//     Modal visible: {modalVisible ? 'YES' : 'NO'}
//   </Text>
// </View>
// To debug modal rendering issues, add a visible background to your modal content:
// In FloatingActionModal.tsx, in styles.modalContent, add:
//   backgroundColor: '#222', // or any visible color
// And/or add a debug Text at the top of the modal content:
//   <Text style={{color: 'white', fontSize: 24, zIndex: 9999}}>MODAL DEBUG</Text>
// This will help you see if the modal content is being rendered but is invisible.

export default useStore;
