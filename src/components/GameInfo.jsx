import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { alertIcon, gameRules } from "../assets";
import { useGlobalContext } from "../context";
import styles from "../styles";
import CustomButton from "./CustomButton";

const GameInfo = () => {
  const { contract,gameData,setShowAlert,setErrorMessage } = useGlobalContext();
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const navigate = useNavigate();
  const handleBattleExit = async () => {
    const battleName=gameData.activeBattle.name;
    try {
      await contract.quitBattle(battleName)
      setShowAlert({
        status:true,type:"info",message:`You're quitting the ${battleName} game!`
      })
    } catch (error) {
      console.log(error)
      setErrorMessage(error)
    }

  };
  return (
    <>
      <div className={styles.gameInfoIconBox}>
        <div
          className={`${styles.gameInfoIcon} ${styles.flexCenter}`}
          onClick={() => setToggleSidebar(true)}
        >
          <img src={alertIcon} className={styles.gameInfoIconImg} alt="info" />
        </div>
      </div>
      <div
        className={`${styles.gameInfoSidebar} ${
          toggleSidebar ? "translate-x-0" : " translate-x-full"
        } ${styles.glassEffect} ${styles.flexBetween} backdrop-blur-3xl`}
      >
        <div className="flex flex-col">
          <div className={styles.gameInfoSidebarCloseBox}>
            <div
              onClick={() => setToggleSidebar(!toggleSidebar)}
              className={`${styles.flexCenter} ${styles.gameInfoSidebarClose}`}
            >
              X
            </div>
          </div>
          <h3 className={styles.gameInfoHeading}>Game Rules:</h3>
          <div>
            {gameRules.map((rule, index) => (
              <p key={`game-rule-${index}`} className={styles.gameInfoText}>
                <span className="font-bold">{index + 1}: </span>
                {rule}
              </p>
            ))}
          </div>
        </div>
        <div className={`${styles.flexBetween} mt-10 gap-4 w-full`}>
          <CustomButton
            title={"Change Battleground"}
            handleClick={() => navigate("/battleground")}
          />
           <CustomButton
            title={"Exit Battleground"}
            handleClick={() => handleBattleExit()}
          />
        </div>
      </div>
    </>
  );
};

export default GameInfo;
