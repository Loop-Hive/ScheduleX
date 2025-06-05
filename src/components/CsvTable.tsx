import React, {useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';

interface CSVTableProps {
  tableData: string[][];
  setTableData: (data: string[][]) => void;
}

const CSVTable: React.FC<CSVTableProps> = ({tableData, setTableData}) => {
  // Transform the data into a 2D array

  // Function to delete a row
  const deleteRow = (rowIndex: number) => {
    const updatedData = tableData.filter((_, index) => index !== rowIndex + 1); // Skip headers
    setTableData([...updatedData]);
  };

  // Function to delete a column
  const deleteColumn = (colIndex: number) => {
    const updatedData = tableData.map(row =>
      row.filter((_, index) => index !== colIndex),
    );
    setTableData(updatedData);
  };
  const showCellText = (text: string) => {
    // Handle cell text display
    Alert.alert('Selected Text', text);
  };

  useEffect(() => {
    console.log('Table data updated:', tableData);
  }, [tableData]);

  return (
    <ScrollView horizontal style={styles.scroller}>
      <View style={styles.table}>
        {tableData.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {rowIndex === 0 && <View style={styles.deleteButton} />}
            {rowIndex > 0 && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteRow(rowIndex - 1)}>
                <Image
                  source={require('../assets/icons/bin-red.png')}
                  style={styles.redBinIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
            {row.map((cell, colIndex) => (
              <View key={colIndex} style={styles.cell}>
                {rowIndex !== 0 && (
                  <TouchableOpacity onPress={() => showCellText(cell)}>
                    <Text style={styles.cellText}>{cell}</Text>
                  </TouchableOpacity>
                )}

                {rowIndex === 0 && (
                  <TouchableOpacity
                    style={styles.deleteButtonCol}
                    onPress={() => deleteColumn(colIndex)}>
                    <Image
                      source={require('../assets/icons/bin-red.png')}
                      style={styles.redBinIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  table: {
    flexDirection: 'column',
  },
  scroller: {
    margin: 10,
    backgroundColor: '#111111',
    padding: 10,
    borderRadius: 10,
  },
  redBinIcon: {
    width: 20,
    height: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cell: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 7,
    paddingHorizontal: 10,
    width: 120,
    height: 50,
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cellText: {
    fontSize: 14,
    color: '#fff',
  },
  deleteButton: {
    // backgroundColor: 'red',
    padding: 5,
    marginLeft: 5,
    width: 50,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  deleteButtonCol: {
    padding: 5,
    marginLeft: 5,
    width: 50,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontWeight: 'bold',
    color: 'red',
  },
});

export default CSVTable;
