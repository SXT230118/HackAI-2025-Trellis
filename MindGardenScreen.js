import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Square = ({ id, color, size, x, y, onPress }) => (
  <TouchableOpacity
    key={id}
    onPress={onPress}
    style={[
      styles.square,
      {
        left: x,
        top: y,
        width: size,
        height: size,
        backgroundColor: color,
      },
    ]}
  />
);

const getNextColor = (color) => {
  switch (color) {
    case '#FF6961': return '#FF964F';
    case '#FF964F': return '#FFFAA0';
    case '#FFFAA0': return '#77DD77';
    case '#77DD77': return '#77DD77';
    default: return '#FF6961';
  }
};

const MindGardenScreen = () => {
  const [squares, setSquares] = useState([]);
  const [selectedSquares, setSelectedSquares] = useState([]);
  const nextSquareId = useRef(0);
  const [containerLayout, setContainerLayout] = useState({ width: 0, height: 0 });

  const initialColors = ['#FF6961', '#FF964F', '#FFFAA0'];
  const maxSquareSizePercentage = 0.6;
  const winningSizePercentage = 0.5;
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const { width } = Dimensions.get('window');
    setContainerLayout({ width: width * 0.9, height: 300 });
  }, []);

  useEffect(() => {
    const winningSize = Math.min(containerLayout.width, containerLayout.height) * winningSizePercentage;
    const largeGreen = squares.find(sq => sq.color === '#77DD77' && sq.size >= winningSize);
    if (largeGreen && !gameOver) {
      setGameOver(true);
    }
  }, [squares, containerLayout.width, containerLayout.height, gameOver]);

  const generateSquare = () => {
    if (gameOver || containerLayout.width === 0 || containerLayout.height === 0) return;
    const maxSize = Math.min(containerLayout.width, containerLayout.height) * 0.3;
    const minSize = 30;
    const size = minSize + Math.random() * (maxSize - minSize);
    const x = Math.random() * (containerLayout.width - size);
    const y = Math.random() * (containerLayout.height - size);
    const color = initialColors[Math.floor(Math.random() * initialColors.length)];

    setSquares(prev => [
      ...prev,
      { id: nextSquareId.current++, color, size, x, y },
    ]);
  };

  const handleSquarePress = (id, color, position, size) => {
    if (gameOver) return;
    const isSelected = selectedSquares.some((sq) => sq.id === id);
    if (isSelected) {
      setSelectedSquares(prev => prev.filter((sq) => sq.id !== id));
    } else {
      setSelectedSquares(prev => [...prev, { id, color, position, size }]);
    }
  };

  useEffect(() => {
    if (selectedSquares.length === 2 && !gameOver) {
      const [sq1, sq2] = selectedSquares;
      if (sq1.id !== sq2.id && sq1.color === sq2.color) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);

        const newSize = Math.sqrt(sq1.size ** 2 + sq2.size ** 2);
        const nextColor = getNextColor(sq1.color);

        const newX = (sq1.position.x + sq2.position.x) / 2 - newSize / 2;
        const newY = (sq1.position.y + sq2.position.y) / 2 - newSize / 2;

        const clampedX = Math.max(0, Math.min(newX, containerLayout.width - newSize));
        const clampedY = Math.max(0, Math.min(newY, containerLayout.height - newSize));

        const maxSize = Math.min(containerLayout.width, containerLayout.height) * maxSquareSizePercentage;
        const finalSize = Math.min(newSize, maxSize);

        const mergedSquare = {
          id: nextSquareId.current++,
          color: nextColor,
          size: finalSize,
          x: clampedX,
          y: clampedY,
        };

        setSquares(prev =>
          prev.filter(sq => sq.id !== sq1.id && sq.id !== sq2.id).concat(mergedSquare)
        );
      }

      setSelectedSquares([]);
    }
  }, [selectedSquares, gameOver, containerLayout.width, containerLayout.height]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{gameOver ? 'game over!' : 'mind garden (merge squares)'}</Text>
      <View
        style={styles.gameContainer}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setContainerLayout({ width, height });
        }}
      >
        {squares.map(square => (
          <Square
            key={square.id}
            {...square}
            onPress={() =>
              handleSquarePress(
                square.id,
                square.color,
                { x: square.x, y: square.y },
                square.size
              )
            }
          />
        ))}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={generateSquare}
        disabled={gameOver}
      >
        <Text style={styles.buttonText}>{gameOver ? 'game over' : 'generate square'}</Text>
      </TouchableOpacity>
      <Text style={styles.instruction}>tap "generate square" to create colorful blocks.</Text>
      <Text style={styles.instruction}>tap 2 blocks of the same color to merge them.</Text>
      <Text style={styles.instruction}>grow a green block to {Math.floor(winningSizePercentage * 100)}% of container size to win!</Text>
      {gameOver && <Text style={styles.gameOverText}>you grew a huge green block 🎉</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4682b4',
    fontFamily: 'HyningsHandwriting',
    textTransform: 'lowercase',
  },
  gameContainer: {
    width: '90%',
    height: 300,
    backgroundColor: '#e0f2f7',
    borderRadius: 10,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  square: {
    position: 'absolute',
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#8fbc8f',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'HyningsHandwriting',
    textTransform: 'lowercase',
  },
  instruction: {
    fontSize: 16,
    color: '#778899',
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'HyningsHandwriting',
    textTransform: 'lowercase',
  },
  gameOverText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    color: 'green',
    fontFamily: 'HyningsHandwriting',
    textTransform: 'lowercase',
  },
});

export default MindGardenScreen;
