import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
} from "react";
import { Contract, ethers } from "ethers";
import Web3Modal from "web3modal";
import { useNavigate } from "react-router-dom";
import { ABI, ADDRESS } from "../contract";
import { createEventListeners } from "./createEventListeners";
import { GetParams } from "../utils/onboard";

const GlobalContext = createContext({
  /**
   * @type {Contract}
   */
  contract: null,
  walletAddress: "",
  showAlert: { status: false, type: "info", message: "" },
  setShowAlert: ({ status = false, type = "info", message = "" }) => {},
  battleName: "",
  setBattleName: () => {},
  gameData: { players: [], pendingBattles: [], activeBattle: null },
  setGameData: ({
    players = [],
    pendingBattles = [],
    activeBattle = null,
  }) => {},
  battleGround: "",
  setBattleGround: () => {},
  setErrorMessage: () => {},
  errorMessage: "",
  /**
   * @type {import("react").MutableRefObject}
   */
  player1Ref: null,
  /**
   * @type {import("react").MutableRefObject}
   */
  player2Ref: null,
  updateCurrentWalletAddress: () => {},
});

export const GlobalContextProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const navigate = useNavigate();
  const [provider, setProvider] = useState("");
  const [contract, setContract] = useState("");
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "info",
    message: "",
  });
  const [battleName, setBattleName] = useState("");
  const [gameData, setGameData] = useState({
    players: [],
    pendingBattles: [],
    activeBattle: null,
  });
  const [updateGameData, setUpdateGameData] = useState(0);
  const [battleGround, setBattleGround] = useState(
    localStorage.getItem("battleground" || "bg-astral")
  );
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const updateCurrentWalletAddress = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts) {
        setWalletAddress(accounts[0]);
      }
      console.log({ accounts });
    } catch (error) {
      console.log(error);
      setShowAlert({ status: true, type: "error", message: error.message });
    }
  };
  const player1Ref = useRef();
  const player2Ref = useRef();

  //Set the wallet address to state
  useEffect(() => {
    updateCurrentWalletAddress();
    window.ethereum.on("accountsChanged", updateCurrentWalletAddress);
  }, []);
  //set the smart contract and provider to state
  useEffect(() => {
    const setSmartContractAndProvider = async () => {
      const web3modal = new Web3Modal();
      const connection = await web3modal.connect();
      const newProvider = new ethers.providers.Web3Provider(connection);

      const signer = newProvider.getSigner();
      const newContract = new ethers.Contract(ADDRESS, ABI, signer);
      setProvider(newProvider);
      setContract(newContract);
    };
    setSmartContractAndProvider();
  }, []);
  useEffect(() => {
    if (showAlert?.status) {
      const timer = setTimeout(() => {
        setShowAlert({ status: false, type: "", message: "" });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showAlert]);
  useEffect(() => {
    if (step !== 0 && contract) {
      createEventListeners({
        contract,
        navigate,
        provider,
        setShowAlert,
        walletAddress,
        setUpdateGameData,
        player1Ref,
        player2Ref,
      });
    }
  }, [contract, step]);

  useEffect(() => {
    const fetchGameData = async () => {
      const fetchedBattles = await contract.getAllBattles();
      const pendingBattles = fetchedBattles.filter((battle) => {
        return battle.battleStatus === 0;
      });
      let activeBattle = null;
      fetchedBattles.forEach((battle) => {
        if (
          battle.players.find(
            (player) => player.toLowerCase() === walletAddress.toLowerCase()
          )
        ) {
          if (battle.winner.startsWith("0x00")) {
            activeBattle = battle;
          }
        }
      });
      console.log(fetchedBattles);
      setGameData({
        pendingBattles: pendingBattles.slice(1),
        activeBattle,
      });
    };
    if (contract) {
      fetchGameData();
    }
  }, [contract, updateGameData]);

  useEffect(() => {
    const resetParams = async () => {
      const currentStep = await GetParams();
      setStep(currentStep.step);
    };
    resetParams();
    window?.ethereum.on("chainChanged", () => resetParams());
    window?.ethereum.on("accountsChanged", () => resetParams());
  }, []);
  useEffect(() => {
    if (errorMessage) {
      console.log(errorMessage);
      const parsedErrorMessage = errorMessage?.reason
        ?.slice("execution reverted: ".length)
        .slice(0, -1);
      if (parsedErrorMessage) {
        setShowAlert({
          type: "failure",
          status: true,
          message: parsedErrorMessage,
        });
      }
    }
  }, [errorMessage]);

  useEffect(() => {
    const getAllPlayersFn = async () => {
      const allPlayers = await contract.getAllPlayers();
      console.log({ allPlayers });
    };
    if (contract) {
      getAllPlayersFn();
    }
  }, [contract]);
  return (
    <GlobalContext.Provider
      value={{
        contract,
        walletAddress,
        showAlert,
        setShowAlert,
        battleName,
        setBattleName,
        gameData,
        setGameData,
        battleGround,
        setBattleGround,
        setErrorMessage,
        errorMessage,
        player1Ref,
        player2Ref,
        updateCurrentWalletAddress,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
