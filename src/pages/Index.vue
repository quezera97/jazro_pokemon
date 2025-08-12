<template>
  <div
    class="container-fluid bg-light py-4"
    @scroll.passive="onScroll"
    ref="scrollContainer"
    style="height: 90vh; overflow-y: auto"
  >
    <section>
      <h1 class="text-center mb-4 fw-bold">Jazro Pokémon App Browser</h1>

      <div class="row justify-content-center mb-4">
        <div class="col-12 col-md-6">
          <input
            type="text"
            class="form-control"
            placeholder="Search Pokémon by name..."
            v-model="searchTerm"
          />
        </div>
      </div>

      <div class="row g-4">
        <div
        class="col-12 col-md-4"
          v-for="pokemon in visiblePokemon"
          :key="pokemon.name"
        >
          <div
            class="card shadow-sm text-center h-100"
            role="button"
            @click="$router.push({ name: 'pokemonDetails', params: { name: pokemon.name } })"
          >
            <img
              :src="pokemon.image"
              :alt="pokemon.name"
              class="card-img-top p-3"
              style="height: 150px; object-fit: contain"
            />
            <div class="card-body">
              <h5 class="card-title text-capitalize">{{ pokemon.name }}</h5>
              <p class="card-text small text-muted mb-0">
                Height: {{ pokemon.height }} | Weight: {{ pokemon.weight }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <LoadingOverlay :visible="loading" />
    </section>
  </div>
</template>

<script>
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import api from "@/plugins/axios";
import { usePokemonStore } from "@/stores/functions";

export default {
  components: { LoadingOverlay },
  setup() {
    const functionsStore = usePokemonStore();

    return {
      functionsStore,
    };
  },
  data() {
    return {
      pokemonList: [],
      searchTerm: "",
      loading: false,
      limit: 9,
      offset: 0,
      hasMore: true,
      page: 1,
      perPage: 12
    };
  },
  computed: {
    filteredPokemon() {
      return this.pokemonList.filter(pokemon =>
        pokemon.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    },
    visiblePokemon() {
      const totalToShow = this.page * this.perPage;
      return this.filteredPokemon.slice(0, totalToShow);
    }
  },
  async mounted() {
    await this.getPokemonList();
  },
  methods: {
    async getPokemonList() {
      if (!this.hasMore || this.loading) return;
      this.loading = true;

      try {
        const listResponse = await api.get(
          `https://pokeapi.co/api/v2/pokemon?limit=${this.limit}&offset=${this.offset}`
        );

        const pokemonList = listResponse.data.results;

        if (pokemonList.length === 0) {
          this.hasMore = false;
          return;
        }

        const detailedList = await Promise.all(
          pokemonList.map(async (pokemon) => {
            const detailResponse = await api.get(pokemon.url);

            let { name, sprites, height, weight } =  detailResponse.data;

            const pokemonInStore = this.functionsStore.getPokemonByName(name);

            return {
              name: name,
              image: sprites.front_default,
              height: pokemonInStore ? pokemonInStore.height : height,
              weight: pokemonInStore ? pokemonInStore.weight : weight,
            };
          })
        );

        this.pokemonList.push(...detailedList);
        this.offset += this.limit;
      } catch (error) {
        console.error("Error fetching Pokémon:", error);
      } finally {
        this.loading = false;
      }
    },

    onScroll() {
      const el = this.$refs.scrollContainer;
      if (!el || this.loading) return;

      const scrollPosition = el.scrollTop + el.clientHeight;
      const bottomThreshold = el.scrollHeight - 100;

      const hasMoreLocal = this.visiblePokemon.length < this.filteredPokemon.length || this.hasMore;

      if (scrollPosition >= bottomThreshold && hasMoreLocal) {
        if (this.visiblePokemon.length < this.filteredPokemon.length) {
          this.page++;
        } else {
          this.getPokemonList();
        }
      }
    }
  }
};
</script>
