<template>
  <div class="container py-4">
    <div class="mb-3">
      <button class="btn btn-outline-secondary btn-sm" @click="$router.back()">
        ← Back
      </button>
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="pokemon" class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow-sm pokemon-card">
          <div class="row g-0">
            <div class="col-md-4 d-flex align-items-center justify-content-center p-3 bg-light">
              <img
                :src="sprite"
                :alt="pokemon.name"
                class="img-fluid"
                style="max-height: 180px;"
              />
            </div>

            <div class="col-md-8">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <h4 class="text-uppercase mb-1">#{{ pokemon.id }} {{ pokemon.name }}</h4>
                  <button
                    type="button"
                    class="btn btn-outline-success"
                    data-bs-toggle="modal"
                    data-bs-target="#editModal"
                    @click="startEdit"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                </div>

                <div class="mb-2">
                  <span
                    class="badge me-1"
                    v-for="t in pokemon.types"
                    :key="t.slot"
                    :class="'type-'+t.type.name"
                  >
                    {{ t.type.name }}
                  </span>
                </div>

                <p class="mb-1"><strong>Height:</strong> {{ pokemon.height }}</p>
                <p class="mb-2"><strong>Weight:</strong> {{ pokemon.weight }}</p>

                <div class="mb-3">
                  <h6 class="mb-1">Abilities</h6>
                  <div>
                    <span class="badge bg-secondary me-1 mb-1" v-for="a in pokemon.abilities" :key="a.ability.name">
                      {{ a.ability.name }} <small v-if="a.is_hidden" class="text-muted">(hidden)</small>
                    </span>
                  </div>
                </div>

                <p class="mb-3"><strong>Base experience:</strong> {{ pokemon.base_experience }}</p>

                <div>
                  <h6 class="mb-2">Stats</h6>
                  <div v-for="s in pokemon.stats" :key="s.stat.name" class="mb-2">
                    <div class="d-flex justify-content-between">
                      <small class="text-capitalize">{{ s.stat.name }}</small>
                      <small class="text-muted">{{ s.base_stat }}</small>
                    </div>
                    <div class="progress" style="height: 8px;">
                      <div
                        class="progress-bar"
                        role="progressbar"
                        :style="{ width: Math.min(s.base_stat, 100) + '%' }"
                        :aria-valuenow="s.base_stat"
                        aria-valuemin="0"
                        aria-valuemax="255"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center text-muted">
      Loading Pokémon...
    </div>

    <LoadingOverlay :visible="loading" />
  </div>

    <div
      class="modal fade"
      id="editModal"
      tabindex="-1"
      aria-labelledby="editModalLabel"
      aria-hidden="true"
      ref="editModalRef"
    >
      <div class="modal-dialog">
        <form class="modal-content" @submit.prevent="submitEdit">
          <div class="modal-header">
            <h5 class="modal-title" id="editModalLabel">Edit Pokémon Info</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" />
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="pokemonName" class="form-label">Name</label>
              <input
                v-model="editForm.name"
                type="text"
                class="form-control"
                id="pokemonName"
                required disabled
              />
            </div>

            <div class="mb-3">
              <label for="pokemonHeight" class="form-label">Height</label>
              <input
                v-model.number="editForm.height"
                type="number"
                min="0"
                class="form-control"
                id="pokemonHeight"
                required
              />
            </div>

            <div class="mb-3">
              <label for="pokemonWeight" class="form-label">Weight</label>
              <input
                v-model.number="editForm.weight"
                type="number"
                min="0"
                class="form-control"
                id="pokemonWeight"
                required
              />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </div>
</template>

<script>
import LoadingOverlay from '@/components/LoadingOverlay.vue';
import { usePokemonStore  } from '@/stores/functions.js';
import { Modal } from 'bootstrap/dist/js/bootstrap.bundle.min';

export default {
  name: "PokemonDetails",
  components: { LoadingOverlay },
  setup() {
    const functionsStore = usePokemonStore();

    return {
      functionsStore,
    };
  },
  data() {
    return {
      pokemon: null,
      loading: false,
      error: null,
      editForm: {
        'name': null,
        'height': null,
        'weight': null,
      }
    };
  },
  computed: {
    sprite() {
      if (!this.pokemon) return "";
      return (
        this.pokemon.sprites?.other?.["official-artwork"]?.front_default ||
        this.pokemon.sprites?.front_default ||
        this.pokemon.sprites?.other?.home?.front_default ||
        ""
      );
    }
  },
  async created() {
    const name = this.$route.params.name || this.$route.params.id;
    if (!name) {
      this.error = "No Pokémon name provided.";
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name.toString().toLowerCase())}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Pokémon not found.");
        throw new Error("Failed to fetch Pokémon.");
      }

      const pokemonFromApi = await res.json();

      if (!pokemonFromApi || !pokemonFromApi.name) {
        this.error = "Error fetching Pokémon.";
        return;
      }

      const pokemonFromState = this.functionsStore.getPokemonByName(pokemonFromApi.name);

      if(!pokemonFromState) {
        this.pokemon = pokemonFromApi;
      }
      else{
        this.pokemon = pokemonFromState;
      }

      this.storePokemonInState();

    } catch (err) {
      this.error = err.message || "Error fetching Pokémon.";
      console.error(err);
    } finally {
      this.loading = false;
    }
  },
  methods: {
    storePokemonInState() {
      const exists = this.functionsStore.pokemons.some(p => p.name === this.pokemon.name);

      if (!exists) {
        this.functionsStore.pokemons.push(this.pokemon);
      } else {
        console.log("Pokemon already exists in the store");
      }

      console.log('Current stored pokemons:', this.functionsStore.pokemons);
    },
    startEdit() {
      this.storePokemonInState();

      this.editForm = { ...this.pokemon };
    },
    submitEdit() {
      this.loading = false;

      try {
        this.functionsStore.updatePokemon(this.pokemon.name, { ...this.editForm });
        this.pokemon = { ...this.pokemon, ...this.editForm };
        const modalEl = document.getElementById('editModal');
        const modal = Modal.getInstance(modalEl) || new Modal(modalEl);
        modal.hide();

      } catch (err) {
        this.error = err.message || "Error storing Pokémon.";
        console.error(err);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.badge {
  text-transform: capitalize;
}

.type-fire { background: linear-gradient(90deg,#ffb27a,#ff6b6b); color: #fff; }
.type-water { background: linear-gradient(90deg,#7cc0ff,#3b82f6); color: #fff; }
.type-grass { background: linear-gradient(90deg,#b7f0a6,#34d399); color: #0b3b2e; }
.type-electric { background: linear-gradient(90deg,#fff29a,#f59e0b); color: #3b2300; }
.type-psychic { background: linear-gradient(90deg,#ffd1f0,#f472b6); color: #3b003b; }

.badge:not([class*="type-"]) { background: #e9ecef; color: #212529; }

.pokemon-card { border-radius: 12px; overflow: hidden; }
.pokemon-card .card-body { padding: 1.25rem; }
</style>
