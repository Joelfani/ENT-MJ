<template>
    <div class="recherche-container">
    <select v-model="localChoix">
        <option v-for="option in options" :key="option.value" :value="option.value">
            {{ option.label }}
        </option>
    </select>
    <input
        type="search"
        placeholder="Saisir mot clé ..."
        v-model="localRech"
    />
    </div>
</template>

<script>
import { debounce } from 'lodash';

export default {
    name: 'SearchInput',
    props: {
        rech: String,
        choix_rech: String,
        options: {
            type: Array,
            required: true
        },
    },

    emits: ['update:rech', 'update:choix_rech', 'search'],
    data() {
    return {
        localRech: this.rech,
        localChoix: this.choix_rech,
        };
    },
    mounted() {
        // Initialisation du debounce avec 300ms de délai, c'est pour retarer l'émission de l'événement 'search'
        // jusqu'à ce que l'utilisateur ait fini de taper.
        this.debouncedEmit = debounce((rech, choix) => {
        this.$emit('search', { rech, choix });
        }, 300);
    },
    watch: {
        localRech(newVal) {
        this.$emit('update:rech', newVal);
        this.debouncedEmit(newVal, this.localChoix);
        },
        localChoix(newVal) {
        this.$emit('update:choix_rech', newVal);
        this.debouncedEmit(this.localRech, newVal);
        },
        rech(newVal) {
        this.localRech = newVal;
        },
        choix_rech(newVal) {
        this.localChoix = newVal;
        },
    },
};
</script>