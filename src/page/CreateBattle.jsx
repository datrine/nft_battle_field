import { Contract } from "ethers";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomButton, CustomInput, PageHOC } from "../components";
import { useGlobalContext } from "../context";
import styles from "../styles";
import GameLoad from "./GameLoad";
styles;
const CreateBattle = () => {
  const { contract, battleName,setBattleName,setErrorMessage,gameData } = useGlobalContext();
  const [waitBattle, setWaitBattle] = useState(false);
  const navigate = useNavigate();
  useEffect(()=>{
    if (gameData?.activeBattle?.battleStatus===1) {
     navigate(`/battle/${gameData.activeBattle.name}`)
    }
   else if (gameData?.activeBattle?.battleStatus===0) {
      setWaitBattle(true)
    }
  },[gameData])
  const handleClick = async () => {
    if (!battleName || !battleName.trim()) {
      return null;
    }
    try {
      await contract.createBattle(battleName);
      setWaitBattle(true);
    } catch (error) {
      console.log(error)
      setErrorMessage(error)
    }
  };
  return (
    <>
      {waitBattle && <GameLoad />}
      <div className="flex flex-col mb-5">
        {" "}
        <CustomInput label={"Battle"} placeholder={"Enter battle name"} handleValueChange={setBattleName} />
        <CustomButton
          title={"Create Battle"}
          handleClick={handleClick}
          restStyles="mt-6"
        />
      </div>
      <p
        className={styles.infoText}
        onClick={() => {
          navigate("/join-battle");
        }}
      >
        Or join alreadly existing battles
      </p>
    </>
  );
};

export default PageHOC(
  CreateBattle,
  <>
    Create <br /> a new Battle
  </>,
  <>Create your own battle and wait for others to join ==</>
);
