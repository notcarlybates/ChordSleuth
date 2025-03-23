import Fretboard from './components/Fretboard';
import ChordSelector from './components/ChordSelector'
import "./App.css";

let selectedColor = 'bg-red-200';

const ChordBox = ({ chord, size = 'h-full w-full', fontsize = 'text-3lg', color = selectedColor, isSquare = true }) => (
  <div
    className={`mx-5 flex items-center justify-center rounded-lg shrink font-thin font-sans text-2xl ${fontsize} ${size} ${color} ${
      isSquare ? 'aspect-square' : ''
    }`}
  >
    {chord}
  </div>
);


const ChordDisplay = () => (
  <div className = "ChordDisplay border flex items-center justify-center font-light shrink text-xl sm:text-2xl md:text-3xl lg:text-4xl w-full h-full mx-2 mt-6 sm:mx-3 md:mx-4 md:max-w lg:mx-5">
    <ChordBox chord = 'D#'/>
    <ChordBox chord = "Amaj7" color="bg-green-200" />
    <ChordBox chord = "Em" color="bg-sky-200" />
    <ChordBox chord = "Asus4" color="bg-fuchsia-200" />
  </div>
);


const App = () => {
    return (
      <div className = 'WholePageContainer border w-screen h-screen items-center align-center shrink'>
          <section className = 'MainPage border flex flex-col m-auto xl:w-1/2 lg:w-3/4 m:w-3/2 sm:w-3/4 h-dvh'>
            <header className = 'Title font-sans border mt-8 font-bold text-5xl'>
              chord sleuth
            </header>
            <div className = 'MainBox border h-full w-full shrink flex flex-col justify-evenly items-center mt-8'>
              <div className = 'ChordSelect flex border w-full h-auto justify-center mb-6'>
                <ChordSelector onSelect={({ chord, fret }) => console.log("Selected chord:", chord, "Fret:", fret)} />

              </div>
              <div className = 'Fretboard flex justify-center shrink w-full h-auto items-center'>
                <Fretboard width = {420} height = {320} numFrets = {4} numStrings = {6}/>
              </div>
              <div className = 'border Generation flex flex-col shrink justify-center items-center h-auto w-full'>
              <ChordBox
                chord="regenerate"
                isSquare={false}
                size="px-6 py-3"
                fontsize="text-xl"
                color="bg-red-200 hover:bg-red-300 transition cursor-pointer"
              />

                   <ChordDisplay />
              </div>
            </div>
              
        </section>
      </div>
    );
};

export default App;