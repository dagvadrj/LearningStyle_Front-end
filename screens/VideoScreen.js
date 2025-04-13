import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, SafeAreaView, TouchableOpacity } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import axios from "axios"; 

const VideoPlayer = () => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseUrl = "https://learningstyle-project-back-end.onrender.com/";
  const route = useRoute();
  const { contentId } = route.params || {};
  console.log(contentId)
  
  const fetchVideoUrl = async () => {
    try {
      const newSearchResponse = await axios.get(`${baseUrl}video/${contentId}`);
      if (newSearchResponse.data.success === true) {
        setVideoUrl(newSearchResponse.data.youtubeUrl);
        console.log(newSearchResponse.data.youtubeUrl)
      } else {
        setError("Бичлэг олдсонгүй");
      }
    } catch (e) {
      setError("Бичлэг олдсонгүй");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (contentId) {
      fetchVideoUrl();
    } else {
      setError("Текстийн ID олдсонгүй");
    }
  }, [contentId]);

  const getYoutubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYoutubeVideoId(videoUrl);

  if (loading) {
    return (
      <View className="w-full h-64 flex justify-center items-center">
        <ActivityIndicator size="large" color="#0066cc" />
        <Text className="mt-2 text-gray-500">Бичлэг ачааллаж байна...</Text>
      </View>
    );
  }

  if (error || !videoId) {
    return (
      <SafeAreaView className="rounded-md overflow-hidden ">
        <View className="items-center mb-6 m-2 border-hairline rounded-md w-48 "> {error && <Text style={{color:"gray"}}>{error}</Text>}
        </View> 
      <YoutubePlayer
        height={500}
        play={playing}
        videoId={videoId}
        onChangeState={(state) => {
          if (state === "ended") setPlaying(false);
        }}
      />
    </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className=" rounded-xl overflow-hidden">
      <YoutubePlayer
        height={250}
        play={playing}
        videoId={videoId}
        onChangeState={(state) => {
          if (state === "ended") setPlaying(false);
        }}
      />
      <TouchableOpacity
        onPress={() => setPlaying((prev) => !prev)}
        className="absolute bottom-4 right-4 p-2 bg-black/50 rounded-full"
      >
        <Ionicons name={playing ? "pause" : "play"} size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default VideoPlayer;
