import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGlobalContext } from "../context";
import styles from "../styles";
import {
  player01 as player01Icon,
  player02 as player02Icon,
  attack,
  attackSound,
  defense,
  defenseSound,
} from "../assets";
import { playAudio } from "../utils/animation";
import { ActionButton, Alert, Card, GameInfo, PlayerInfo } from "../components";
const Battle = () => {
  const {
    contract,
    gameData,
    walletAddress,
    showAlert,
    setShowAlert,
    battleGround,
    setBattleGround,
    setErrorMessage,player1Ref,player2Ref
  } = useGlobalContext();
  const [player1, setPlayer1] = useState({});
  const [player2, setPlayer2] = useState({});
  const { battleName } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const getPlayerInfo = async () => {
      try {
        let player01Address = null;
        let player02Address = null;
        if (
          gameData.activeBattle.players[0].toLowerCase() ===
          walletAddress.toLowerCase()
        ) {
          player01Address = gameData.activeBattle.players[0];
          player02Address = gameData.activeBattle.players[1];
        } else {
          player01Address = gameData.activeBattle.players[1];
          player02Address = gameData.activeBattle.players[0];
        }
        const p1TokenData = await contract.getPlayerToken(player01Address);
        const player01 = await contract.getPlayer(player01Address);
        const player02 = await contract.getPlayer(player02Address);
        const p1Att = p1TokenData.attackStrength.toNumber();
        const p1Def = p1TokenData.defenseStrength.toNumber();
        const p1H = player01.playerHealth.toNumber();
        const p1M = player01.playerMana.toNumber();
        const p2H = player02.playerHealth.toNumber();
        const p2M = player02.playerMana.toNumber();
        console.log({ player01 });
        setPlayer1({
          ...player01,
          att: p1Att,
          def: p1Def,
          health: p1H,
          mana: p1M,
        });

        setPlayer2({ ...player02, att: "X", def: "X", health: p2H, mana: p2M });
      } catch (error) {
        console.log(error);
        setErrorMessage(error);
      }
    };
    console.log({ contract, gameData, battleName });
    if (contract && gameData && battleName) {
      getPlayerInfo();
    }
  }, [contract, gameData, battleName]);
  const makeAMove = async (choice) => {
    try {
      playAudio(choice === 1 ? attackSound : defenseSound);
      await contract.attackOrDefendChoice(choice, battleName);
      setShowAlert({
        status: true,
        type: "info",
        message: `Initializing ${choice === 1 ? "attack" : "defense"}`,
      });
    } catch (error) {
      console.log(error);
      setErrorMessage(error)
    }
  };
useEffect(()=>{
  const timer=setTimeout(()=>{
    if(!gameData.activeBattle) navigate('/')
  },2000);
  return ()=>clearTimeout(timer)
},[])

  return (
    <div
      className={`${styles.flexBetween} ${styles.gameContainer} ${battleGround}`}
    >
      {showAlert?.status && (
        <Alert type={showAlert.type} message={showAlert.message} />
      )}
      <PlayerInfo player={player2} playerIcon={player02Icon} mt />
      <div className={`${styles.flexCenter} flex-col my-10`}>
        <Card  playerTwo card={player2} cardRef={player2Ref} title={player2?.playerName} />
        <div className="flex items-center flex-row">
          <ActionButton
            imgUrl={attack}
            handleClick={() => makeAMove(1)}
            restStyles="mr-2 hover:border-yellow-400"
          />
          <Card
            card={player1}
            cardRef={player1Ref}
          
            title={player1?.playerName}
            restStyles="mt-3"
          />
          <ActionButton
            imgUrl={defense}
            handleClick={() => makeAMove(2)}
            restStyles="ml-6 hover:border-red-600"
          />
        </div>{" "}
      </div>
      <PlayerInfo player={player1} playerIcon={player01Icon} mt />
      <GameInfo />
    </div>
  );
};

export default Battle;
