<template>
<div style="text-align: center;">

    <!-- Button neutre -->
    <a v-if="neutre_but" data-toggle="modal" :data-target="'#' + btn_neutre_modal + id" :class="'btn ' + btn_neutre_class" @click="$emit('btn_neutre_click')"> {{ label_neutre_but }} </a>
    
    <!-- Button for editing -->
    <a v-if="userStore.edit && !modalcompte && view_but_mod" data-toggle="modal" :data-target="'#mod' + id" class="btn btn-primary" @click="recovery_data"> Modifier </a>
    <!-- Button for account management -->
    <a v-if="userStore.edit && modalcompte" data-toggle="modal" :data-target="'#mod' + id" class="btn btn-primary"> Modifier </a>

    <!-- Button for deletion -->
    <a v-if="userStore.delet && view_but_del" data-toggle="modal" :data-target="'#sup' + id" class="btn btn-danger">Supprimer</a>

    <!-- Modal for editing -->
    <ModalComponent v-if="!modalcompte" :id="'mod' + id" :title="'Modifier ' + title" :mini_title="mini_title">
        <slot name="form_modifier"></slot>
    </ModalComponent>

    <!-- Modal for deletion -->
    <ModalComponent :id="'sup' + id" title="ÊTES-VOUS SÛR DE VOULOIR SUPPRIMER ?">
        <div class="text-center">
        <h5 style="color: red">Cette action est irréversible.</h5>
        <hr />
        <button class="btn btn-danger" data-dismiss="modal" @click="handleDelete">
            Supprimer
        </button>
        <button class="btn btn-secondary" data-dismiss="modal">Annuler</button>
        </div>
    </ModalComponent>

    <!-- Modal for account management -->
    <EditUser v-if="modalcompte" :id="id"/>

    <!--Modal for neutre button -->
    
</div>


</template>

<script>
import { useUserStore } from '@/store/user';
import { useDeleteStore } from '@/store/delete';
import { mapStores } from 'pinia';
import ModalComponent from './ModalComponent.vue';
import EditUser from './compte/editUser.vue';
import { useEditdataStore } from '@/store/editData';
import { supabase } from '@/supabase';

export default {
name: 'TableAction',
emits: ['mod_data', 'btn_neutre_click'],
props: {
    id: {
    type: [String, Number],
    required: true,
    },
    title: {
    type: String,
    default: '',
    },
    tableSuppr: {
    type: String,
    },
    tableEdit: {
    type: String,
    },
    modalcompte: {
    type: Boolean,
    default: false,
    },
    view_but_del: {
        type: Boolean,
        default: true,
    },
    view_but_mod: {
        type: Boolean,
        default: true,
    },
    notSuppr: {
        type: Boolean,
        default: false,
    },
    neutre_but: {
        type: Boolean,
        default: false,
    },
    label_neutre_but: {
        type: String,
        default: 'Neutre',
    },
    btn_neutre_class: {
        type: String,
        default: 'btn-light',
    },
    btn_neutre_modal: {
        type: String,
        default: 'neutre',
    },
    mini_title: {
        type: String,
        default: '',
    },
},
components: {
    ModalComponent,
    EditUser,
},
computed: {
    ...mapStores(useUserStore, useDeleteStore,useEditdataStore),

},
methods: {

    // Methode pour supprimer un item
    async handleDelete() {
    if (this.notSuppr) {
        await supabase
            .from('infoc')
            .update({prom_ele:null, rang:null})
            .eq('id', this.id);
            this.$emit('loadData'); // Emit an event to notify parent component to reload data
        return;
    }else{
        try {
            await this.deleteStore.deleteItem(this.tableSuppr, this.id);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        }
    }
    
    },

    // Methode pour envoyer l'id de l'item a modifier
    async recovery_data() {
        try {
            const data = await this.edite_dataStore.editdataItem(this.tableEdit, this.id);
            this.mod_data(data);
        } catch (error) {
            console.error('Erreur lors de la recupperation des donnees:', error);
        }
    },
    //Envoi des donnees a modifier
    mod_data(data) {
        this.$emit('mod_data', data);
    },
},
};
</script>