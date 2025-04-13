import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  SafeAreaView // Use SafeAreaView for better layout on iOS
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
// axios импорт шаардлагагүй болсон (зөвхөн стрим URL ашиглаж байгаа тул)
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { Ionicons } from '@expo/vector-icons'; // Make sure expo icons are installed
import Slider from '@react-native-community/slider'; // Make sure slider is installed
// AsyncStorage - Шаардлагатай бол (жишээ нь токен) үлдээж болно, одоохондоо хэрэггүй.

// --- Constants ---
const BASE_URL = "https://learningstyle-project-back-end.onrender.com/"; // Ensure this is correct
const isAndroid = Platform.OS === "android";

// --- Helper Functions ---
const formatTime = (milliseconds) => {
  if (milliseconds == null || isNaN(milliseconds) || milliseconds < 0) return "00:00";
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};


const AudioLessonScreen = ({navigation}) => {
  const route = useRoute();
  // textId болон title-г navigation params-аас авна
  const { textId, title: initialTitle } = route.params;

  // --- State ---
  // audioDetails state шаардлагагүй
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Loading state for audio
  const [error, setError] = useState(null);
  const sliderRef = useRef(null);
  const [texts, setTexts] = useState("")
  // --- Audio Mode Configuration (Runs once on mount) ---
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    }).catch(error => console.error("Error setting audio mode:", error));
  }, []);

  // --- Playback Status Update Handler ---
  const onPlaybackStatusUpdate = useCallback((status) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error(`Playback Error: ${status.error}`);
        setError("Аудио тоглуулах явцад алдаа гарлаа.");
        Alert.alert("Алдаа", "Аудио тоглуулах явцад алдаа гарлаа.");
        setIsPlaying(false);
        // Consider unloading sound here?
      }
      // isBuffering state нэмж болно
    } else {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
       // Баффер хийж байвал isLoading харуулж болно
       // setIsLoading(status.isBuffering);

      if (status.didJustFinish && !status.isLooping) {
        console.log("Audio finished playing");
        // Дууссаны дараа эхлэл рүү нь очоод зогсоно
        sound?.setPositionAsync(0).catch(e => console.error("Set position failed:", e));
        sound?.pauseAsync().catch(e => console.error("Pause failed:", e));
        setIsPlaying(false);
      }
    }
  }, [sound]); // Dependency on sound

  // --- Load Sound (Runs when textId is available) ---
  useEffect(() => {
    if (!textId) {
        setError("Текст ID олдсонгүй.");
        setIsLoading(false);
        return;
    }

    const loadSound = async () => {
      setIsLoading(true);
      setError(null);

      // Unload previous sound if any
      if (sound) {
        console.log("Unloading previous sound...");
        await sound.unloadAsync();
        setSound(null);
        setPosition(0);
        setDuration(0);
        setIsPlaying(false);
      }

      useEffect(() => {
        const fetchLessonAndTexts = async () => {
          try {
            setLoadingLesson(true);
            const response = await axios.get(`https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3`);
            if (response.status === 200 && response.data.success === true) {
              const allTexts = response.data.texts;
              setTexts(allTexts);
              console.log(response.data.texts.content);
    
              const textOnly = filteredTexts.filter(
                (text) => text.lessonId === lessonId
              );
              //   const audioOnly = filtered.filter((text) => text.type === "audio");
              //   const videoOnly = filtered.filter((text) => text.type === "video");
    
              setTextCount(textOnly.length);
              setAudioCount(textOnly.length);
              setVideoCount(textOnly.length);
    
              const matchedLesson = lessons.find(
                (lesson) => lesson._id === lessonId
              );
              if (matchedLesson) {
                setActiveTopTab(matchedLesson.lessonName);
                setLesson(matchedLesson);
              }
            }
          } catch (error) {
            console.error("Алдаа:", error);
          } finally {
            setLoadingLesson(false);
          }
        };
    
        if (lessonId) fetchLessonAndTexts();
      }, [lessonId, lessons]);
      try {
        // 
        const audioUri = `${BASE_URL}/text/stream-read/${textId}`;
        console.log("Using text-to-speech stream URI:", audioUri);
        // --------------------------------

        console.log(`Loading sound from: ${audioUri}`);
        const { sound: newSound, status } = await Audio.Sound.createAsync(
           { uri: audioUri },
           {
             shouldPlay: true, // <<< Play товч дарахад эхэлнэ
             progressUpdateIntervalMillis: 500 // Update status every 500ms
           },
           onPlaybackStatusUpdate
        );

        setSound(newSound);
        // isLoading-г onPlaybackStatusUpdate дотор isBuffering-р удирдаж болно,
        // эсвэл энд шууд false болгож болно.
        setIsLoading(false); // Audio бэлэн болсон

      } catch (error) {
          console.error("Error loading/playing sound:", error);
          // Серверээс ирж буй алдааг харуулах оролдлого
          const errorMessage = error.response?.data?.message || error.message || "Аудиог ачааллахад алдаа гарлаа.";
          setError(errorMessage);
          Alert.alert("Алдаа", errorMessage);
          setSound(null);
          setIsPlaying(false);
          setIsLoading(false);
      }
    };

    loadSound();

    // --- Cleanup Function ---
    return () => {
      console.log("TextToSpeechPlayerScreen cleanup: Unloading sound...");
      sound?.unloadAsync().catch(error => console.error("Error unloading sound on cleanup:", error));
    };
    // Run when textId changes (or on mount if textId is ready)
  }, [textId, onPlaybackStatusUpdate]); // Add onPlaybackStatusUpdate dependency

  // --- Playback Control Functions ---
  const togglePlayback = useCallback(async () => {
    if (!sound || isLoading) return; // Sound бэлэн биш эсвэл ачааллаж байвал юу ч хийхгүй
    try {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await sound.pauseAsync();
        } else {
           // Дууссан байвал эхлэл рүү нь очоод тоглуулна
           if (status.didJustFinish) {
             await sound.setPositionAsync(0);
           }
          await sound.playAsync();
        }
        // isPlaying state is set by onPlaybackStatusUpdate
      }
    } catch (error) {
      console.error("Error toggling playback:", error);
      setError("Тоглуулах/Зогсооход алдаа гарлаа.");
    }
  }, [sound, isLoading]);

  const onSliderValueChange = (value) => {
    // Slider-г чирж байх үед цагийг шууд шинэчлэх (UI-г илүү жигд болгоно)
    setPosition(value);
  };

  const onSlidingComplete = async (value) => {
    if (!sound || isLoading || !duration) return; // Дуу байхгүй, ачааллаж буй эсвэл үргэлжлэх хугацаа 0 бол алгасна
    try {
        // Slider-н утга duration-аас ихгүй байхыг баталгаажуулах
        const seekPosition = Math.min(value, duration);
        setPosition(seekPosition); // UI-г шинэчлэх
        await sound.setPositionAsync(seekPosition);
      // Slider-г чирж дуусаад зогссон байсан бол автоматаар тоглуулахгүй
    } catch (error) {
      console.error("Error seeking audio:", error);
      setError("Аудионы байрлал өөрчлөхөд алдаа гарлаа.");
    }
  };

  // --- Seek Forward/Backward Functions ---
  const seekBackward = useCallback(async () => {
      if (!sound || isLoading || !duration) return;
      const newPosition = Math.max(0, position - 15000); // 15 секунд ухраана
      try {
          await sound.setPositionAsync(newPosition);
          setPosition(newPosition); // UI-г шинэчлэх
      } catch (error) {
          console.error("Error seeking backward:", error);
      }
  }, [sound, isLoading, position, duration]);

  const seekForward = useCallback(async () => {
      if (!sound || isLoading || !duration) return;
      const newPosition = Math.min(duration, position + 15000); // 15 секунд урагшлуулна
      try {
          await sound.setPositionAsync(newPosition);
          setPosition(newPosition); // UI-г шинэчлэх
      } catch (error) {
          console.error("Error seeking forward:", error);
      }
  }, [sound, isLoading, position, duration]);


  // --- Render ---
  const getTitle = () => {
      return initialTitle || "Текст уншигч"; // title дамжуулаагүй бол default гарчиг
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>{getTitle()}</Text>
             {/* Spacer for centering title */}
            <View style={{ width: 30 }} />
        </View>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#ff7043" />
            <Text style={styles.statusText}>Аудиог бэлдэж байна...</Text>
          </View>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={60} color="#ef5350" />
            <Text style={styles.errorText}>{error}</Text>
            {/* Retry товчийг дарахад loadSound-г дахин дуудахаар хийж болно */}
            {/* <TouchableOpacity onPress={loadSound} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Дахин оролдох</Text>
            </TouchableOpacity> */}
             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Буцах</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Player UI (Only when loaded and no error) */}
        {isLoading && !error && ( // sound state-г шалгах шаардлагагүй, учир нь !error, !isLoading бол sound үүссэн байх ёстой
          <View style={styles.playerContainer}>
            {/* Title */}
            <Text style={styles.audioTitle} numberOfLines={2}>{getTitle()}</Text>

            {/* Artwork Placeholder */}
            <View style={styles.artworkContainer}>
              <Ionicons name="reader-outline" size={100} color="#cccccc" />
            </View>

            {/* Slider */}
            <Slider
              ref={sliderRef}
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration > 0 ? duration : 1} // Max утга 0 эсвэл NaN байхаас сэргийлнэ
              value={position}
              minimumTrackTintColor="#ff7043"
              maximumTrackTintColor="#d0d0d0"
              thumbTintColor="#ff7043"
              onValueChange={onSliderValueChange} // Чирж байх үед UI шинэчлэх
              onSlidingComplete={onSlidingComplete} // Чирж дуусаад дууны байрлалыг өөрчлөх
              disabled={!sound || duration <= 0} // Дуугүй эсвэл хугацаа 0 бол идэвхгүй
            />

            {/* Time Displays */}
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

            {/* Controls */}
            <View style={styles.controlsContainer}>
              {/* Backward Button */}
                <TouchableOpacity onPress={seekBackward} disabled={!sound || isLoading || duration <= 0}>
                  <Ionicons name="play-back" size={32} color={!sound || isLoading || duration <= 0 ? "#ccc" : "#444"} />
                </TouchableOpacity>

              <TouchableOpacity
                style={styles.playPauseButtonMain}
                onPress={togglePlayback}
                disabled={!sound || isLoading} // Дуу бэлэн биш эсвэл ачааллаж байвал идэвхгүй
              >
                {/* Play/Pause Icon */}
                  <Ionicons
                    name={isPlaying ? "pause-circle" : "play-circle"}
                    size={70}
                    color={!sound ? "#ccc" : "#ff7043"}
                  />
              </TouchableOpacity>

                {/* Forward Button */}
                <TouchableOpacity onPress={seekForward} disabled={!sound || isLoading || duration <= 0}>
                    <Ionicons name="play-forward" size={32} color={!sound || isLoading || duration <= 0 ? "#ccc" : "#444"} />
                </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// --- Styles (өмнөхтэйгээ ижил, шаардлагатай бол засаарай) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    // padding: 15, // Padding applied to specific sections if needed
  },
  header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      backgroundColor: '#fff',
  },
  backButton: {
      padding: 5, // Increase tap area
  },
  headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      flex: 1, // Allow title to take space
      textAlign: 'center', // Center title
      marginHorizontal: 10, // Prevent overlap with buttons
  },
  centered: {
    flex: 1,
    marginBottom:-500,
    alignItems:"center"
  },
  statusText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
    errorText: {
      marginTop: 15,
      fontSize: 16,
      color: '#ef5350',
      textAlign: 'center',
      marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#ff7043',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 20,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
  playerContainer: {
    flex: 1,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',
    padding: 20,
  },
    artworkContainer: { // Текст уншигч тул icon өөрчилсөн
        width: 250,
        height: 250,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
  audioTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30, // Space between title and artwork
    color: '#333',
  },
  slider: {
    width: '100%', // Take full width of container
    height: 40, // Standard slider height
    marginBottom: 10, // Space below slider
  },
  timeContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5, // Align with slider edges
    marginBottom: 25, // Space below time
  },
  timeText: {
    fontSize: 14,
    color: '#555',
  },
  controlsContainer: {
    width: '80%', // Control width
    flexDirection: 'row',
    justifyContent: 'space-around', // Space out controls
    alignItems: 'center',
  },
    playPauseButtonMain: {
        marginHorizontal: 20, // Space around main button
    },
});

export default AudioLessonScreen;