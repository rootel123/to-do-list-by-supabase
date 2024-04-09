import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Session } from "@supabase/supabase-js";
import { FC, useEffect, useState } from "react";
import { IToDo } from ".";
import CreateToDo from "./components/CreateToDo";
import ToDoCard from "./components/ToDoCard";
import supabase from "./lib/supabaseClient";

const App: FC = () => {
  const [session, setSession] = useState<Session | null>(null); // 초기값이 Session 이거나 null
  const [toDos, setToDos] = useState<IToDo[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    }); // then ==> 비동기 처리 / getSession이 처리되고 나서 then으로 넘어온다.

    supabase.functions.invoke("get-all-to-do").then(({ data }) => {
      setToDos(data);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe(); // 컴포넌트가 실행될때, 사라짐..?  // subscription이 생성될때, 그걸 사라지게함...?
  }, []);

  useEffect(() => console.log(session), [session]);

  if (!session) {
    return <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />;
  } else {
    return (
      <div>
        <div>
          Hello, {session.user.email}{" "}
          <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
        </div>
        <CreateToDo />
        <ul>
          {toDos?.map((v) => (
            <ToDoCard key={v.id} todo={v} />
          ))}
        </ul>
      </div>
    );
  }
};

export default App;
