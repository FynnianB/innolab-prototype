import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AppProvider } from "./context/AppContext";
import { ChatProvider } from "./context/ChatContext";

export default function App() {
  return (
    <AppProvider>
      <ChatProvider>
        <RouterProvider router={router} />
      </ChatProvider>
    </AppProvider>
  );
}