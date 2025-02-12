import createNewStore from "./zustand/store";

interface InitialStateType {
    gameId?: string;
    organizer?: {
        name: string;
        id: string;
    }
    user?: {
        name: string;
        id: string;
    }
}

const initialState:InitialStateType={
   
}

export const globalState = createNewStore(initialState,{
    name:`global`,
    devTools:true,
    persist:false
})