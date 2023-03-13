import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { battlegrounds } from "../assets";
import { CustomButton, PageHOC } from "../components";
import { useGlobalContext } from "../context";
import styles from "../styles";

const JoinBattle = () => {
  const {
    contract,
    setErrorMessage,
    gameData,
    walletAddress,
    setBattleName,
    setGameData,
    battleName,
    setShowAlert,
  } = useGlobalContext();
  const navigate = useNavigate();
  const handleClick = async (battleName) => {
    setBattleName(battleName);
    try {
      await contract.joinBattle(battleName);
      setShowAlert({
        status: true,
        type: "success",
        message: `Joining ${battleName}`,
      });
    } catch (error) {
      console.log(error);
      setErrorMessage(error);
    }
  };
  useEffect(() => {
    if (gameData.activeBattle.name === 1) {
      navigate(`/battle/${gameData.activeBattle.name}`);
    }
  }, [gameData]);
  return (
    <>
      <h2 className={styles.joinHeadText}>Available battles</h2>
      <div className={styles.joinContainer}>
        {gameData.pendingBattles?.length ? (
          gameData.pendingBattles
            .filter((battle) => !battle.players.includes(walletAddress))
            .map((battle, index) => (
              <div
                key={battle.name + "_" + index}
                className={styles.flexBetween}
              >
                <p className={styles.joinBattleTitle}>{battle.name}</p>
                <CustomButton
                  title={"Join"}
                  handleClick={() => {
                    handleClick(battle.name);
                  }}
                />
              </div>
            ))
        ) : (
          <></>
        )}
      </div>
      <p
        className={styles.infoText}
        onClick={() => {
          navigate("/create-battle");
        }}
      >
        Or create a new battle
      </p>
    </>
  );
};

export default PageHOC(
  JoinBattle,
  <>
    Join
    <br /> a battle
  </>,
  <>Join already existing battle</>
);
