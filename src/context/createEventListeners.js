import { ethers } from "ethers"
import { defenseSound } from "../assets";
import { ABI } from "../contract"
import { playAudio, sparcle } from "../utils/animation";
const EMPTY_ACCOUNT = "0x000000000000000000000000"
const AddNewEvent = (eventFilter, provider, cb) => {
    provider.removeListener(eventFilter);
    provider.on(eventFilter, (Logs) => {
        const parseLog = (new ethers.utils.Interface(ABI)).parseLog(Logs);
        cb(parseLog);
    })
}

const getCoords = (cardRef) => {
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    return { pageX: left + width / 2, pageY: top + height / 2.25 }
}

export const createEventListeners = ({ navigate, walletAddress, provider, contract, setShowAlert, setUpdateGameData, player1Ref, player2Ref }) => {
    const NewPlayerEventFilter = contract.filters.NewPlayer();

    AddNewEvent(NewPlayerEventFilter, provider, ({ args }) => {
        console.log("New player created!", args);
        if (walletAddress.toLowerCase() == args.owner.toLowerCase()) {
            setShowAlert({ status: true, type: "info", message: "Player has being succesfully registered" })
        navigate("/create-battle")
        }
    });

    const NewGameTokenEventFilter = contract.filters.NewGameToken();

    AddNewEvent(NewGameTokenEventFilter, provider, ({ args }) => {
        console.log("New game token created!", args);
        if (walletAddress.toLowerCase() == args.owner.toLowerCase()) {
            setShowAlert({ status: true, type: "info", message: `Game token: ${args}` })
        }
    });

    const NewBattleEventFilter = contract.filters.NewBattle();

    AddNewEvent(NewBattleEventFilter, provider, ({ args }) => {
        console.log("New battle started!", args, walletAddress);
        if (walletAddress.toLowerCase() === args.player1.toLowerCase() || walletAddress.toLowerCase() == args.player2.toLowerCase()) {
            navigate(`/battle/${args.battleName}`)
            setUpdateGameData(prev => ++prev)
        }
    })


    const BattleMoveEventFilter = contract.filters.BattleMove();

    AddNewEvent(BattleMoveEventFilter, provider, ({ args }) => {
        console.log("Battle move make!", args)
    })


    const RoundEndedEventFilter = contract.filters.RoundEnded();

    AddNewEvent(RoundEndedEventFilter, provider, ({ args }) => {
        console.log("Battle move make!", args, walletAddress)
        for (let i = 0; i < args.damagedPlayers.length; i++) {
            if (args.damagedPlayers[i] !== EMPTY_ACCOUNT) {
                if (args.damagedPlayers[i] === walletAddress) {
                    sparcle(getCoords(player1Ref))
                } else if (args.damagedPlayers[i] === walletAddress) {
                    sparcle(getCoords(player2Ref))
                }
            } else {
                playAudio(defenseSound)
            }

        }
    })


    const BattleEndedEventFilter = contract.filters.BattleEnded();

    AddNewEvent(BattleEndedEventFilter, provider, ({ args }) => {
        console.log("New battle started!", args, walletAddress);
        if (walletAddress.toLowerCase() === args.winner?.toLowerCase()) {
            setShowAlert({
                status: true,
                type: "success",
                message: "You won!"
            })
        } else if (walletAddress.toLowerCase() === args.loser?.toLowerCase()) {
            setShowAlert({
                status: true,
                type: "failure",
                message: "You lost!"
            })
        } 
        navigate("/create-battle");
    })
}