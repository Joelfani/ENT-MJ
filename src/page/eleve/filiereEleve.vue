<template>
    <LoadingComponent v-if="isLoading" dataload="des filieres" />
    <div v-else>
        <a v-if="userStore.add" class="btn btn-success btn-lg" data-toggle="modal" data-target="#add_filiere"> Ajouter </a>

        <TableComponent :columns="columns" :rows="filieres">
            <template #actions="{ item }">
                <TableAction :id="item.id" title="la filière" table-suppr="filiere" tableEdit="filiere" @mod_data="dataInitialFormMod">
                    <template #form_modifier>
                        <FormComponent :inputs="input_mod" label_button="Modifier" @submit="modFiliere"/>
                    </template>
                </TableAction>
            </template>
        </TableComponent>

        <!--Modal for adding a new filiere-->
        <ModalComponent id="add_filiere" title="Ajouter une filière">
            <FormComponent :inputs="input_add" label_button="Ajouter" @submit="addFiliere"/>
        </ModalComponent>
    </div>
</template>
<script>
import FormComponent from '@/components/formComponent.vue';
import LoadingComponent from '@/components/loadingComponent.vue';
import ModalComponent from '@/components/ModalComponent.vue';
import TableAction from '@/components/TableAction.vue';
import TableComponent from '@/components/TableComponent.vue';
import { useSubscribeStore } from '@/store/realtime';
import { useUserStore } from '@/store/user';
import { supabase } from '@/supabase';
import { mapStores } from 'pinia';

export default {
    name: 'FiliereEleve',
    components: {
    TableComponent,
    LoadingComponent,
    TableAction,
    FormComponent,
    ModalComponent,
},
    data() {
        return {
            isLoading: true,
            filieres: [],
            columns: [
                { key: 'nomlong', label: "Nom de la filiere" },
                { key: 'nom', label: 'Abréviation' },
            ],
            initialValues: {},
            add_initialValue: {
                nomlong: '',
                nom: '',
            },
        };
    },
    computed: {
        ...mapStores(useUserStore, useSubscribeStore),
        input_add() {
            return [
                { id: 'nomlong', type: 'text', label: "Nom de la filière", placeholder: "Entrez le nom de la filière", initialValue: this.add_initialValue.nomlong, required: true },
                { id: 'nom', type: 'text', label: 'Abréviation', placeholder: 'Entrez l\'abréviation', initialValue: this.add_initialValue.nom, required: true },
            ];
        },
        input_mod() {
            return [
                { id: 'id', type: 'hidden', initialValue: this.initialValues.id },
                { id: 'nomlong', type: 'text', label: "Nom de la filière", placeholder: "Entrez le nom de la filière", initialValue: this.initialValues.nomlong, required: true },
                { id: 'nom', type: 'text', label: 'Abréviation', placeholder: 'Entrez l\'abréviation', initialValue: this.initialValues.nom, required: true },
            ];
        },
    },
    methods: {
        async getFilieres() {
            try {
                const { data, error } = await supabase
                .from('filiere')
                .select('*')
                .order('id', { ascending: false });
                if (error) throw error;
                
                
                this.filieres = data;
                this.isLoading = false;
            } catch (error) {
                console.error('Erreur lors de la récupération des filières:', error);
                this.promotions = [];
                this.isLoading = false;
            }
        },
        async addFiliere(data) {
            const doubleData = await supabase
                .from('filiere')
                .select('*')
                .or(`nom.eq.${data.nom},nomlong.eq.${data.nomlong}`)
            if (doubleData.data.length > 0) {
                alert('Le nom ou l/abréviation entree existe déjà.');
                return;
            }else{
                try{
                    const { error } = await supabase.from('filiere').insert([data]);
                    if (error) {
                        throw error;
                    }
                    alert('Filière ajoutée avec succès !');
                    this.add_initialValue = {
                        nomlong: '',
                        nom: '',
                    };
                } catch (error) {
                    console.error('Erreur lors de l\'ajout de la filière:', error);
                }
                
            }
        },

        dataInitialFormMod(item) {
            this.initialValues = item;
        },
        async modFiliere(data) {
            const doubleData = await supabase
                .from('filiere')
                .select('*')
                .or(`nom.eq.${data.nom},nomlong.eq.${data.nomlong}`)
                .neq('id', this.initialValues.id);
            if (doubleData.data.length > 0) {
                alert('Le nom ou l/abréviation entrée existe déjà.');
                return;
            }else{
                try {
                    const { error } = await supabase
                        .from('filiere')
                        .update(data)
                        .eq('id', this.initialValues.id);
                        alert('Filière modifiée avec succès !');
                    if (error) {
                        throw error;
                    }
                }
                catch (error) {
                    console.error('Erreur lors de la modification de la filière:', error);
                }
            }
            
        },
        

        // Méthode pour souscrire aux changements en temps réel
        subscribeToTable() {
            this.realtimeStore.subscribeToTable('filiere','filieres',this)
        },
    },
    async mounted() {
        await this.getFilieres();
        this.subscribeToTable();
    },

    beforeUnmount() {
    // Nettoyer la souscription
    this.realtimeStore.unsubscribeFromTable('mjg_promotion');
},
};
</script>