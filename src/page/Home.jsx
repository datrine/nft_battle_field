import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomButton, CustomInput, PageHOC } from "../components";
import { useGlobalContext } from "../context";

const Home = () => {
  const { contract, walletAddress,setErrorMessage, gameData, setShowAlert } =
    useGlobalContext();
  const [playerName, setPlayerName] = useState();
  const navigate = useNavigate();
  const handleClick = async () => {
    try {
      const playerExists = await contract.isPlayer(walletAddress);
      if (!playerExists) {
        await contract.registerPlayer(playerName, playerName);
        setShowAlert({
          status: "true",
          type: "info",
          message: `${playerName} is being summoned!`,
        });
      }
    } catch (error) {
      setErrorMessage(error)
    }
  };
  useEffect(() => {
    if (!contract) {
      return;
    }
    const checkForPlayerToken = async () => {
      const playerExists = await contract.isPlayer(walletAddress);
      const playerTokenExists = await contract.isPlayerToken(walletAddress);
      console.log({ playerExists, playerTokenExists });
      if (playerExists && playerTokenExists) {
        navigate("/create-battle");
      }
    };
    checkForPlayerToken();
  }, [contract]);
  useEffect(() => {
    if (gameData.activeBattle) {
      navigate(`/battle/${gameData.activeBattle.name}`);
    }
  }, [gameData]);
  return (
    <div className="flex flex-col">
      <CustomInput
        label="Name"
        placeholder="Enter player name"
        value={playerName}
        handleValueChange={setPlayerName}
      />{" "}
      <CustomButton
        title="Register"
        handleClick={handleClick}
        restStyles="mt-6"
      />{" "}
    </div>
  );
};

export default PageHOC(
  Home,
  <>
    Welcome to Avax Gods <br /> a Web3 NFT Card Game
  </>,
  <>
    Connect your wallet to start playing <br /> the ultimate Web3 Battle Card
  </>
);
