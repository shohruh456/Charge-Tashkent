import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStationStore = create(persist((set) => ({
  stations: [],
  query: '',
  networks: [],
  connectors: [],
  status: 'all',
  favorites: [],
  selectedId: null,
  setStations: (stations) => set({ stations }),
  addStation: (station) => set((state) => ({ stations: [...state.stations, station] })),
  updateStation: (id, patch) => set((state) => ({
    stations: state.stations.map((station) => station.id === id ? { ...station, ...patch } : station),
  })),
  removeStation: (id) => set((state) => ({
    stations: state.stations.filter((station) => station.id !== id),
    favorites: state.favorites.filter((favorite) => favorite !== id),
  })),
  setQuery: (query) => set({ query }),
  toggleNetwork: (network) => set((state) => ({
    networks: state.networks.includes(network) ? state.networks.filter((item) => item !== network) : [...state.networks, network],
  })),
  toggleConnector: (connector) => set((state) => ({
    connectors: state.connectors.includes(connector) ? state.connectors.filter((item) => item !== connector) : [...state.connectors, connector],
  })),
  setStatus: (status) => set({ status }),
  setSelectedId: (selectedId) => set({ selectedId }),
  toggleFavorite: (id) => set((state) => ({
    favorites: state.favorites.includes(id) ? state.favorites.filter((item) => item !== id) : [...state.favorites, id],
  })),
  clearFilters: () => set({ query: '', networks: [], connectors: [], status: 'all' }),
}), {
  name: 'charge-tashkent-preferences',
  partialize: ({ favorites }) => ({ favorites }),
}))
