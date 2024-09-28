import { useEffect, useState } from 'react'
import '../style/miniGame.css'

interface Card {
  src: string
  matched: boolean
  id?: number
}

interface SingleCardProps {
  card: Card
  handleChoice: (card: Card) => void;
  flipped: boolean;
  disabled: boolean;
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
        <img
          className="back"
          src="/uploads/epl-logo.png"
          onClick={handleClick}
          alt="card back"
        />
      </div>
    </div>
  )
}

const App: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([])
  const [turns, setTurns] = useState(0)
  const [choiceOne, setChoiceOne] = useState<Card | null>(null)
  const [choiceTwo, setChoiceTwo] = useState<Card | null>(null)
  const [disabled, setDisabled] = useState(false)

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
      // Add more teams as needed
    ]

    const shuffledCards = [...cardImages, ...cardImages]
      .sort(() => Math.random() - 0.5)
      .map((card) => ({ ...card, id: Math.random() }))
    setChoiceOne(null)
    setChoiceTwo(null)
    setCards(shuffledCards)
    setTurns(0)
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

  return (
    <div className="App">
      <h1>EPL Match</h1>
      <button className='button-game' onClick={shuffleCards}>New Game</button>
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
      <p>Turns: {turns}</p>
    </div>
  )
}

export default App
