import './App.css'
import Main from "./pages/Main.tsx";
import {AuthProvider} from "./providers/AuthContext.tsx";

function App() {

  return (
    <>
        <AuthProvider>
            <Main />
        </AuthProvider>
    </>
  )
}

export default App
