import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import MainLayout from './Layouts/MainLayout';
import ChatBotLayout from './Layouts/ChatBotLayout';
import ChatBotFriend from './pages/ChatBotFriend';

function App() {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route path='/' element={<MainLayout />}>
                <Route index element={<LogIn />}/>
                <Route path='signup' element={<SignUp />}/>

                <Route path='login' element={<LogIn />}/>

                {/* Chatbot --Protected */}
                <Route path='chatbot' element={<ChatBotLayout />}>
                    <Route index element={<ChatBotFriend/>}/>
                </Route>
            </Route>
        )
    )
    return (
        <>
            <RouterProvider router={router} />
        </>
    )
}

export default App
