import { Route, Router } from "@solidjs/router";
import "./app.css";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { clientOnly } from "@solidjs/start";

const Home = clientOnly(() => import("./routes/index"));

const queryClient = new QueryClient();

export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          <QueryClientProvider client={queryClient}>
            {props.children}
          </QueryClientProvider>
        </>
      )}
    >
      <Route path="/" component={Home} />
    </Router>
  );
}
