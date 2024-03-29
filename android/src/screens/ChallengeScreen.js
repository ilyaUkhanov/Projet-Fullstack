import React, { useEffect, useState } from 'react';
import { StyleSheet, ToastAndroid } from 'react-native';
import ChallengeApi from '../api/challenge.api';
import { Spacer, Button, Image, SvgDrawing } from '../components/ui';
import ThemedPage from '../components/ui/ThemedPage';
import { DarkerTheme, LightTheme } from '../styles/theme';
import { useTheme } from '../styles';
import UserSessionApi from '../api/user-session.api';
import HTML from "react-native-render-html";
import { useMapDrawing } from '../utils/map.utils'
import Svg from 'react-native-svg';

let createStyles = (selectedTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      marginLeft: 20,
    },
    text: {
      padding: 5,
      paddingTop: 0,
      margin: 10,
      color: selectedTheme.colors.text,
    },
    complete: {
      padding: 5,
      color: selectedTheme.colors.text,
      textAlign: "center"
    }
  });
}

const ChallengeScreen = ({ navigation, route }) => {
  const id = route.params.id;

  const [challengeDetails, setChallengeDetails] = useState([]);
  const [base64, setBase64] = useState(null);

  const [obstacles, setObstacles] = useState([]);
  const [cantConnect, setCantConnect] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState(false);

  const { checkpointList, segmentList, obstacleList } = useMapDrawing({
    imageWidth: 400,
    imageHeight: 300
  }, challengeDetails.scale, challengeDetails?.checkpoints, challengeDetails?.segments, obstacles, 22, undefined, []);

  const theme = useTheme();
  let selectedTheme = theme?.mode === "dark" ? DarkerTheme : LightTheme;
  let styles = createStyles(selectedTheme);

  let subscribeToChallenge = async () => {
    try {
      setSubscribeLoading(true)
      await UserSessionApi.create({ challengeId: id }).then(
        () => {
          navigation.navigate('Mes courses', {
            highLightId: id
          });
        }
      );
    } catch (e) {
      console.log(e)
      ToastAndroid.show("Erreur lors de l'inscription. Veuillez Réessayer plus tard.");
    }finally {
      setSubscribeLoading(false)
    }
  }

  let readData = async () => {
    try {
      let responseSession = await UserSessionApi.self(id);

      if (responseSession.status === 200) {
        setUserSession(responseSession.data);
      }
    } catch { }

    try {

      var response = await ChallengeApi.getDetail(id);

      setChallengeDetails(response.data);

      let responseObstacles = [];

      response.data.segments.forEach(async (element) => {
        element.obstacles.forEach(elementOb => {
          responseObstacles.push(elementOb);
        });
      });

      setObstacles(responseObstacles);

      let responseBackground = await ChallengeApi.getBackgroundBase64(id);

      setBase64(responseBackground.data.background);

    } catch {
      setCantConnect(true);
    }
  };

  useEffect(() => {
    readData();
  }, []);

  return (
    <ThemedPage
      title={challengeDetails?.name}
      onUserPress={() => navigation.openDrawer()}
      loader={challengeDetails == undefined || base64 == null}
      showReturn={true}
      onReturnPress={() => navigation.navigate('Challenges')}
      cantConnect={cantConnect}
    >

      <Image
        height={300}
        width={400}
        base64={base64}
        isLoading={base64 === null}
      >
        <SvgDrawing height={300} width={400}>
          <Svg width={400} height={300} viewBox={`0 0 ${400} ${300}`} style={styles.svg}>

            {segmentList}

            {checkpointList}

            {obstacleList}

          </Svg>
        </SvgDrawing>
      </Image>


      {
        challengeDetails?.description ?
          <HTML source={{ html: challengeDetails?.description }} />
          :
          null
      }

      <Spacer />
      <Button title="S'inscrire au challenge" color="blue" center onPress={() => subscribeToChallenge()} loader={subscribeLoading}/>
    </ThemedPage>
  );
};

export default ChallengeScreen;
