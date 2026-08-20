import { useEffect, useState } from 'react'
import { recordScore, getHighScore } from '../services/MiniGameMatch'
import { UserResponse } from '../services/Auth'
import { useToast } from '../context/ToastContext'
import '../style/miniGame.css'

interface Card {
  src: string
  matched: boolean
  id?: number
}

interface SingleCardProps {
  card: Card
  handleChoice: (card: Card) => void
  flipped: boolean
  disabled: boolean
}

interface Props {
  currentUser: UserResponse | null
}

const SingleCard: React.FC<SingleCardProps> = ({ card, handleChoice, flipped, disabled }) => {
  const handleClick = () => {
    if (!disabled) {
      handleChoice(card)
    }
  }

  return (
    <div className="card-game">
      <div className={flipped ? 'flipped' : ''}>
        <img className="front" src={card.src} alt="card front" />
        <img className="back" src="/uploads/epl-logo.png" onClick={handleClick} alt="card back" />
      </div>
    </div>
  )
}

const MiniGame: React.FC<Props> = ({ currentUser }) => {
  const { showToast } = useToast()
  const [cards, setCards] = useState<Card[]>([])
  const [turns, setTurns] = useState(0)
  const [choiceOne, setChoiceOne] = useState<Card | null>(null)
  const [choiceTwo, setChoiceTwo] = useState<Card | null>(null)
  const [disabled, setDisabled] = useState(false)
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [hasRecordedThisGame, setHasRecordedThisGame] = useState(false)

  // The session user's `_id` isn't always actually populated at runtime —
  // login/session responses carry the JWT payload shape ({ id, username,
  // role }), not the full UserResponse. `.id` is the reliable field here.
  const currentUserId = (currentUser as unknown as { id?: string; _id?: string } | null)?.id ?? currentUser?._id

  const shuffleCards = () => {
    const cardImages: Card[] = [
      { src: '/uploads/Arsenal_PR01Llr.png', matched: false },
      { src: '/uploads/Chelsea_A9h8r1R.png', matched: false },
      { src: '/uploads/Manutd_CwrwrPV.png', matched: false },
      { src: '/uploads/Liverpool_HoymQ5A.png', matched: false },
      { src: '/uploads/Tottenham_fMhJwrN.png', matched: false },
      { src: '/uploads/Mancity_e6NGUOG.png', matched: false },
      { src: '/uploads/Newcastle_SGEdcip.png', matched: false },
      { src: '/uploads/Astonvilla_gKRqxyi.png', matched: false },
      { src: '/uploads/Brighton_vvcCto4.png', matched: false },
      { src: '/uploads/Westham_F1aNDJ2.png', matched: false },
    ]

    const shuffledCards = [...cardImages, ...cardImages]
      .sort(() => Math.random() - 0.5)
      .map((card) => ({ ...card, id: Math.random() }))
    setChoiceOne(null)
    setChoiceTwo(null)
    setCards(shuffledCards)
    setTurns(0)
    setHasRecordedThisGame(false)
  }

  const handleChoice = (card: Card) => {
    choiceOne ? setChoiceTwo(card) : setChoiceOne(card)
  }

  useEffect(() => {
    if (choiceOne && choiceTwo) {
      setDisabled(true)
      if (choiceOne.src === choiceTwo.src) {
        setCards((prevCards) => {
          return prevCards.map((card) => {
            if (card.src === choiceOne.src) {
              return { ...card, matched: true }
            } else {
              return card
            }
          })
        })
        resetTurn()
      } else {
        setTimeout(() => resetTurn(), 1000)
      }
    }
  }, [choiceOne, choiceTwo])

  const resetTurn = () => {
    setChoiceOne(null)
    setChoiceTwo(null)
    setTurns((prevTurns) => prevTurns + 1)
    setDisabled(false)
  }

  useEffect(() => {
    shuffleCards()
  }, [])

  // Fetch the logged-in user's current best (fewest turns) on load.
  useEffect(() => {
    const fetchBestScore = async () => {
      if (!currentUserId) return
      try {
        const highScore = await getHighScore(currentUserId)
        setBestScore(highScore > 0 ? highScore : null)
      } catch (error) {
        console.error('Failed to fetch best score:', error)
      }
    }
    fetchBestScore()
  }, [currentUserId])

  // Detect the win condition (every card matched) and record the score —
  // guarded so it only fires once per completed game, not on every render
  // after the win.
  useEffect(() => {
    const allMatched = cards.length > 0 && cards.every((card) => card.matched)
    if (!allMatched || hasRecordedThisGame) return

    setHasRecordedThisGame(true)

    if (!currentUserId) {
      showToast(`Matched everything in ${turns} turns! Sign in to save your best score.`, 'info')
      return
    }

    const submitScore = async () => {
      try {
        const result = await recordScore(currentUserId, turns)
        setBestScore(result.bestScore)
        if (result.isNewBest) {
          showToast(`New best! ${turns} turns.`, 'success')
        } else {
          showToast(`Matched everything in ${turns} turns! Best stays at ${result.bestScore}.`, 'info')
        }
      } catch (error) {
        console.error('Failed to record score:', error)
        showToast('Could not save your score. Please try again.', 'error')
      }
    }
    submitScore()
  }, [cards, hasRecordedThisGame, currentUserId, turns, showToast])

  return (
    <div className="minigame-page">
      <div className="minigame-shell">
        <h1 className="minigame-title">EPL Match</h1>
        <p className="minigame-subtitle">Match every crest in as few turns as possible.</p>

        <div className="minigame-stats">
          <div className="minigame-stat">
            <div className="minigame-stat-number">{turns}</div>
            <div className="minigame-stat-label">Turns</div>
          </div>
          <div className="minigame-stat">
            <div className="minigame-stat-number">{bestScore ?? '—'}</div>
            <div className="minigame-stat-label">Your Best</div>
          </div>
        </div>

        {!currentUserId && <p className="minigame-guest-notice">Sign in to save your best score.</p>}

        <button className="button-game" onClick={shuffleCards}>
          New Game
        </button>

        <div className="card-grid">
          {cards.map((card) => (
            <SingleCard
              key={card.id}
              card={card}
              handleChoice={handleChoice}
              flipped={card === choiceOne || card === choiceTwo || card.matched}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default MiniGame
