import logo from './logo.svg';
import './App.css';
import {MainForm} from './components/mainForm';
import { ResultTable } from './components/resultTable';
import { ResultContextProvider } from './context/resultContextProvider';

function App() {

  
  return (
    <div className="App">
      <ResultContextProvider>
        <MainForm />
        <ResultTable />
      </ResultContextProvider>
    </div>
  );
}

export default App;
