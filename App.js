import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import WeatherInfo from "./components/WeatherInfo";
import UnitsPicker from "./components/UnitsPicker";
import ReloadIcon from "./components/ReloadIcon";
import WeatherDetails from "./components/WeatherDetails";
import { colors } from "./utils/index";
import { WEATHER_API_KEY } from "@env";
import { SearchBar } from "react-native-elements";

const BASE_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather?";

export default function App() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [unitsSystem, setUnitsSystem] = useState("imperial");
  const [value, setValue] = useState("");

  const handleOnChange = (event) => {
    setValue(event);
  };

  const onClear = () => {
    setValue("");
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => load(), 1500);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value]);

  useEffect(() => {
    load();
  }, [unitsSystem]);

  async function load() {
    setCurrentWeather(null);
    setErrorMessage(null);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setErrorMessage("Access to location is needed to run the app");
        return;
      }

      const location = await Location.getCurrentPositionAsync();

      const { latitude, longitude } = location.coords;

      // alert(`${latitude} and ${longitude}`);

      const weatherUrl =
        value !== ""
          ? `${BASE_WEATHER_URL}q=${value}&units=${unitsSystem}&appid=${WEATHER_API_KEY}`
          : `${BASE_WEATHER_URL}lat=${latitude}&lon=${longitude}&units=${unitsSystem}&appid=${WEATHER_API_KEY}`;

      const response = await fetch(weatherUrl);

      const result = await response.json();

      if (response.ok) {
        setCurrentWeather(result);
      } else {
        setErrorMessage(result.message);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  if (currentWeather) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <View style={styles.main}>
          <UnitsPicker
            unitsSystem={unitsSystem}
            setUnitsSystem={setUnitsSystem}
          />
          <View style={styles.search}>
            <SearchBar
              placeholder="City"
              onChangeText={handleOnChange}
              onClear={onClear}
              value={value}
              lightTheme
              round
              containerStyle={{
                backgroundColor: "white",
                borderTopWidth: 0,
                borderBottomWidth: 0,
                margin: 0,
                padding: 0,
              }}
              inputContainerStyle={{ borderRadius: 10 }}
            />
          </View>
          <ReloadIcon load={load} />
          <WeatherInfo currentWeather={currentWeather} value={value} />
        </View>
        <WeatherDetails
          currentWeather={currentWeather}
          unitsSystem={unitsSystem}
        />
      </View>
    );
  } else if (errorMessage) {
    return (
      <View style={styles.container}>
        <ReloadIcon load={load} />
        <Text style={{ textAlign: "center" }}>{errorMessage}</Text>
        <StatusBar style="auto" />
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.PRIMARY_COLOR} />
        <StatusBar style="auto" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  main: {
    flex: 1,
    justifyContent: "center",
  },
  search: {
    width: 200,
    position: "absolute",
    top: 40,
    right: 60,
  },
});
