import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AiCard from '../components/Cards/AiCard';
import {GoogleGenAI, Type} from '@google/genai';
import Loader from '../components/Loader';
import pickCSVFile from '../utils/csv-picker';
import CSVTable from '../components/CsvTable';
import {GOOGLE_GEMINI_API_KEY} from '@env';
import {formatTimetableToMarkdown} from '../utils/ArrayFormatter';

interface Slots {
  start: string;
  end: string;
  // room string or null
  roomName: string | null;
}

interface Days {
  mon: Slots[];
  tue: Slots[];
  wed: Slots[];
  thu: Slots[];
  fri: Slots[];
  sat: Slots[];
  sun: Slots[];
}

interface CardProps {
  id: number;
  title: string;
  target_percentage: number;
  tagColor: string;
  delay: number;
  days: Days;
}

const dayItem = {
  type: Type.OBJECT,
  description: 'start time < end time',
  properties: {
    start: {
      type: Type.STRING,
      description: 'Start time, Format: HH:MM (min: 00:00, max: 23:59)',
      nullable: false,
    },
    end: {
      type: Type.STRING,
      description: 'End time, Format: HH:MM (min: 00:00, max: 23:59)',
      nullable: false,
    },
    roomName: {
      type: Type.STRING,
      description: 'Room name, maximum characters: 15',
      nullable: true,
    },
  },
  required: ['start', 'end'],
};

const AiScreen: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [data, setCardsData] = useState<CardProps[]>([]);
  // const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const handleCSVUpload = async () => {
    if (csvData.length > 0) {
      setCsvData([]);
      return;
    }
    try {
      const result = await pickCSVFile();
      if (Array.isArray(result)) {
        const matrix: string[][] = [];
        for (let i = 0; i < result.length; i++) {
          const row: string[] = Object.values(result[i]);
          matrix.push(row);
        }

        setCsvData(matrix);
      } else {
        Alert.alert('Error', 'Invalid CSV file format.');
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      Alert.alert('Error', 'Failed to upload CSV file.');
    }
  };

  const handleUserPrompt = async () => {
    setLoading(true);
    if (!userInput) {
      Alert.alert('Error', 'Please enter a prompt.');
      setLoading(false);
      return;
    }
    if (userInput.trim() === '') {
      Alert.alert('Error', 'Please enter a prompt.');
      setLoading(false);
      return;
    }

    if (userInput.length === 0) {
      return;
    }
    const timetableString =
      csvData.length > 0 ? formatTimetableToMarkdown(csvData) : '';
    const userPrompt =
      userInput +
      (timetableString.length > 0 ? `\n\n${timetableString}` : '') +
      '\n\nRules: 1.You will generate maximum 10 objects at a time, 2. If no meaningful prompt is provided generate 3 sample card objects, 3. If Timing and day are provided, refactor it so that intervals do not overlap on same day, 4. If target_percentage provided is <1 or >100 set it to 1 or 100 respectively and 75 if not provided, 5. If no tagColor provided, #3b82f6 is default value.';
    try {
      const ai = new GoogleGenAI({apiKey: GOOGLE_GEMINI_API_KEY.toString()});
      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: userPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.NUMBER,
                  description: 'Unique identifier, starting from 1',
                  nullable: false,
                },
                title: {
                  type: Type.STRING,
                  description:
                    'Title of the item as Described in the prompt, Max Length: 15 characters',
                  nullable: false,
                },
                target_percentage: {
                  type: Type.NUMBER,
                  description: 'Target percentage',
                  nullable: false,
                },
                tagColor: {
                  type: Type.STRING,
                  description:
                    'Tag color choices: #F93827(red), #FF5733(light red), #FF9D23)(orange), #80C4E9(sky blue), #4CC9FE(blue), #08C2FF(cyan), #3b82f6 (dark blue), #16C47F(dark green), #2ECC71(green), #8FD14F(light green), #FFFFFF(white)',
                  nullable: false,
                },
                days: {
                  type: Type.OBJECT,
                  description:
                    'Schedule for each day of the week, empty object if no time or day is defined in prompt',
                  properties: {
                    mon: {
                      type: Type.ARRAY,
                      items: dayItem,
                    },
                    tue: {
                      type: Type.ARRAY,
                      items: dayItem,
                    },
                    wed: {
                      type: Type.ARRAY,
                      items: dayItem,
                    },
                    thu: {
                      type: Type.ARRAY,
                      items: dayItem,
                    },
                    fri: {
                      type: Type.ARRAY,
                      items: dayItem,
                    },
                    sat: {
                      type: Type.ARRAY,
                      items: dayItem,
                    },
                    sun: {
                      type: Type.ARRAY,
                      items: dayItem,
                    },
                  },
                },
              },
              required: [
                'id',
                'title',
                'target_percentage',
                'tagColor',
                'days',
              ],
            },
          },
        },
      });
      const parsedData = JSON.parse(aiResponse.text || '[]');
      if (Array.isArray(parsedData)) {
        setCardsData(parsedData as CardProps[]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };
  const handleAcceptAll = async () => {};
  const handleRejectAll = async () => {
    setCardsData([]);
  };
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer2}>
        <View style={styles.aiBox}>
          <Image
            source={require('../assets/icons/navigation/ai.png')}
            style={styles.aiIcon}
          />

          <Text style={styles.aiText}>Schedule Generator AI</Text>
        </View>
      </View>
      <View style={styles.centerContainer}>
        <TextInput
          style={styles.TextInput}
          placeholder="Enter your prompt here"
          placeholderTextColor={'#737373'}
          multiline={true}
          numberOfLines={4}
          maxLength={1000}
          value={userInput}
          onChangeText={setUserInput}
        />
        {data.length > 0 ? (
          <View style={styles.AcRjBtn}>
            <TouchableOpacity
              style={[styles.customButton, styles.rejectAll]}
              onPress={handleRejectAll}>
              <Text style={styles.customButtonText}>Reject All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.customButton, styles.acceptAll]}
              onPress={handleAcceptAll}>
              <Text style={styles.customButtonText}>Accept All</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <Loader size="large" color="#ffffff" />
        ) : (
          <View style={styles.AcRjBtn}>
            <TouchableOpacity
              style={styles.customButton}
              onPress={handleUserPrompt}
              disabled={loading} // Disable button when loading
            >
              <Text style={styles.customButtonText}>Generate✨</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={
                csvData.length > 0 ? styles.clearCsvBtn : styles.customButton
              }
              onPress={handleCSVUpload}
              disabled={loading} // Disable button when loading
            >
              {csvData.length > 0 ? (
                <Text style={styles.customButtonText}>Clear CSV</Text>
              ) : (
                <Text style={styles.customButtonText}>Upload CSV</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
      {/* <CSVTable data={csvData} /> */}

      <ScrollView style={styles.scrollContainer}>
        {data.length === 0 ? (
          csvData.length > 0 ? (
            <CSVTable tableData={csvData} setTableData={setCsvData} />
          ) : (
            <View style={styles.aiContainer}>
              <Image
                source={require('../assets/images/ai-magic.png')}
                style={styles.magicImage}
              />
              <Text style={styles.aiheading}>
                Enter a prompt or upload a csv file containing subject details
                to generate your schedule with AI
              </Text>
            </View>
          )
        ) : (
          data.map((item, index) => (
            <AiCard
              key={item.id}
              id={item.id}
              title={item.title}
              target_percentage={item.target_percentage}
              tagColor={item.tagColor}
              days={item.days}
              delay={index * 100}
            />
          ))
        )}
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
    paddingBottom: 30,
  },
  aiIcon: {width: 25, height: 25},
  magicImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginHorizontal: 'auto',
    marginTop: 100,
  },

  centerContainer: {
    position: 'relative',
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexDirection: 'column',
    width: '95%',
    marginHorizontal: 'auto',
    marginBottom: 10,
  },
  aiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    width: '95%',
    marginHorizontal: 'auto',
  },
  TextInput: {
    borderWidth: 1,
    borderRadius: 8,
    width: '100%',
    borderColor: '#404040',
    paddingHorizontal: 10,
    color: '#fff',
    marginBottom: 10,
  },
  customButton: {
    backgroundColor: '#3b82f6', // Button background color
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearCsvBtn: {
    backgroundColor: 'red', // Button background color
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptAll: {
    backgroundColor: '#0EAA00', // Button background color
  },
  rejectAll: {
    backgroundColor: '#C20000', // Button background color
  },
  customButtonText: {
    color: '#ffffff', // Button text color
    fontSize: 16,
    fontWeight: 500,
  },
  AcRjBtn: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  heading: {
    color: '#fff',
    padding: 10,
    fontSize: 24,
    fontWeight: 'bold',
  },
  heading2: {
    color: 'grey',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  aiheading: {
    color: '#464646',
    fontSize: 18,
    maxWidth: '90%',
    textAlign: 'center',
    fontWeight: 400,
    marginVertical: 10,
  },
  contentContainer2: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignContent: 'center',
  },
  scrollContainer: {
    minHeight: '50%',
  },
  aiBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  spacer: {
    height: 50,
    width: '100%',
  },
});

export default AiScreen;
