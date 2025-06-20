<template>
<div style="text-align: center;">
    <a v-if="userStore.edit && !modalcompte" data-toggle="modal" :data-target="'#mod' + id" class="btn btn-primary" @click="recovery_data"> Modifier </a>

    <a v-if="userStore.edit && modalcompte" data-toggle="modal" :data-target="'#mod' + id" class="btn btn-primary"> Modifier </a>

    <a v-if="userStore.delet && view_but_del" data-toggle="modal" :data-target="'#sup' + id" class="btn btn-danger">Supprimer</a>

    <!-- Modal for editing -->
    <ModalComponent v-if="!modalcompte" :id="'mod' + id" :title="'Modifier ' + title">
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
</div>


</template>

<script>
import { useUserStore } from '@/store/user';
import { useDeleteStore } from '@/store/delete';
import { mapStores } from 'pinia';
import ModalComponent from './ModalComponent.vue';
import EditUser from './compte/editUser.vue';
import { useEditdataStore } from '@/store/editData';

export default {
name: 'TableAction',
emits: ['mod_data'],
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
    try {
        await this.deleteStore.deleteItem(this.tableSuppr, this.id);
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
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