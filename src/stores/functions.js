import { defineStore } from "pinia";

export const usePokemonStore = defineStore('pokemon', {
  state: () => ({
    pokemons: []
  }),
  getters: {
    getPokemonByName: (state) => (name) => {
      return state.pokemons.find(p => p.name === name);
    }
  },
  actions: {
    updatePokemon(name, updatedData) {
      const index = this.pokemons.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
      if (index !== -1) {
        this.pokemons[index] = { ...this.pokemons[index], ...updatedData };
      }
    }
  }
});
