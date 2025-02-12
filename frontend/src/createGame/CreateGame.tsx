
import { FormEvent, useEffect, useState } from "react";
import { createGame } from "./api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { globalState } from "../globalState";

export function CreateGame() {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create')
  const { set, organizer, user, gameId } = globalState()
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const gId = params.get("gameId")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true);
    try {
      let payload = {}
      if(activeTab == "create") {
        if(!organizer?.name) return
        payload = {
          user: organizer
        }
      } else {
        if(!gameId && !user?.id) return
        payload = {
          gameId: gameId,
          user: user
        }
      } 
      const [data, err] = await createGame(payload);
      if (err) {
        throw err;
      }
      if(activeTab == "create") {
        set({organizer: data.user, gameId: data.gameId, user: data.user})
      } else {
        set({user: data.user, gameId: data.gameId, organizer: undefined})
      }
      navigate(`/game`)
    } catch (err: any) {
      console.log(err.message);
    }
    console.log(organizer, user, gameId)
    setLoading(false);
  }

  useEffect(() => {
    if(gId) {
      set({gameId: gId})
      setActiveTab("join")
    }
  }, [gId])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          {loading && <div>loading...</div>}
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome
          </h2>
        </div>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="sm:flex sm:justify-center mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex" aria-label="Tabs">
                {['create', 'join'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as 'create' | 'join')}
                    className={`${
                      activeTab === tab
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm capitalize`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
          {activeTab === 'create' && (
            <div>
              <label htmlFor="organizer.name" className="block text-sm font-medium text-gray-700">
                Organizer Name
              </label>
              <div className="mt-1">
                <input
                  id="organizer.name"
                  name="organizer.name"
                  type="text"
                  required
                  value={organizer?.name}
                  onChange={(e) => set({ organizer : {name: e.target.value} })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>)}

            {activeTab === 'join' && (
              <>
              <div>
                <label htmlFor="gameId" className="block text-sm font-medium text-gray-700">
                  Game Id
                </label>
                <div className="mt-1">
                  <input
                    id="gameId"
                    name="gameId"
                    type="text"
                    required
                    value={gameId}
                    onChange={(e) => set({ gameId: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
              <label htmlFor="user.name" className="block text-sm font-medium text-gray-700">
                User Name
              </label>
              <div className="mt-1">
                <input
                  id="user.name"
                  name="user.name"
                  type="text"
                  required
                  value={user?.name}
                  onChange={(e) => set({ user : {name: e.target.value} })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            </>
            )}

            {/* {state.error && (
              <div className="text-red-600 text-sm">{state.error}</div>
            )} */}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {activeTab === 'create' ? 'Create Game' : 'Join Game'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}