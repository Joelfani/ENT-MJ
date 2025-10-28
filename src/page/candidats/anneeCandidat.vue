<template>
    <LoadingComponent v-if="isLoading" dataload="des années de concours" />
    <div v-else>

        <a v-if="userStore.add" class="btn btn-success btn-lg" data-toggle="modal" data-target="#add_annee"> Ajouter </a>

        <TableComponent :columns="columns" :rows="anneeCan">
            <template #actions="{ item }">
                <TableAction :id="item.id" title="l'année de concours" table-suppr="mjg_promc" tableEdit="mjg_promc" @mod_data="dataInitialFormMod">
                    <template #form_modifier>
                        <FormComponent :inputs="input_mod" label_button="Modifier" @submit="mod_annee_concours"/>
                    </template>
                </TableAction>
            </template>
        </TableComponent>
    </div>
    
    <!--Modal for adding a new annee--->

    <ModalComponent id="add_annee" title="Ajouter une annee">
        <FormComponent :inputs="input_add" label_button="Ajouter" @submit="add_annee_concours"/>
    </ModalComponent>
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
    name: 'AnneeCandidat',
    components: {
        TableComponent,
        TableAction,
        LoadingComponent,
        FormComponent,
        ModalComponent,
    },
    data() {
        return {
            columns: [
                { key: 'annee', label: 'Années de concours' },
            ],
            isLoading: true,
            anneeCan: [],
            subscription: null, // Stocker la souscription

            //data pour le formulaire de modification
            initialValues: {},
            add_initialValue: {
                annee: '',
            }, // Valeur initiale pour le formulaire d'ajout
        };
    },
    computed: {
        ...mapStores(useUserStore,useSubscribeStore),

        input_add() {
        return [
            { id: 'annee', type: 'number', label: 'Année de concours', placeholder: "Entrez le nom de l'année",initialValue: this.add_initialValue.annee, required: true },
        ];
        },
        input_mod() {
        return [
            { id: 'id', type: 'hidden', initialValue: this.initialValues.id },
            { id: 'annee', type: 'number', label: 'Année de concours', placeholder: 'Entrez le nom de l/année',initialValue: this.initialValues.annee, required: true },
        ];
        }   
    },

    methods: {
        //fonction pour gerer les annees de concours
        async get_annees_concours() {
            const {data} = await supabase
                .from('mjg_promc')
                .select('*')
                .order('id', { ascending: false });
            this.anneeCan = data || [];
            this.isLoading = false;
        },
        // Méthode pour ajouter une année de concours
        async add_annee_concours(data) {
            const doubleData = await supabase
                .from('mjg_promc')
                .select('*')
                .eq('annee', data.annee);
            if (doubleData.data.length > 0) {
                alert('Cette année de concours existe déjà.');
                this.add_initialValue = {annee:null}; // Réinitialiser le champ après l'erreur
                return;
            }else if(data.annee < 2000 || data.annee > 2100) {
                alert('Veuillez entrer une année valide. Entre 2000 et 2100.');
                this.add_initialValue = {annee:null}; // Réinitialiser le champ après l'erreur
                return;
            }
            // Insertion de la nouvelle année de concours
            else{
                try {
                    const { error } = await supabase
                        .from('mjg_promc')
                        .insert([
                            { annee: data.annee }
                        ]);
                    if (error) {
                        throw error;
                    }
                    alert('Année de concours ajoutée avec succès.');

                    this.add_initialValue = {annee:null}; // Réinitialiser le champ après l'ajout
                } catch (error) {
                    console.error('Erreur lors de l\'ajout de l\'année de concours:', error);
                    alert('Une erreur est survenue lors de l\'ajout de l\'année de concours.');
                }
            }
            
        },

        // Méthodes pour modifier une promotion

        dataInitialFormMod(data) {
            // Initialiser le formulaire de modification avec les données de la promotion
            this.initialValues = data;
        },

        async mod_annee_concours(data) {
            // Vérifier si l'année existe déjà
            const doubleData = await supabase
                .from('mjg_promc')
                .select('*')
                .eq('annee', data.annee)
                .neq('id', data.id); // Exclure l'ID actuel pour éviter les doublons

            if (doubleData.data.length > 0 && doubleData.data[0].id !== data.id) {
                alert('Cette année de concours existe déjà.');
                return;
            }else if(data.annee < 2000 || data.annee > 2100) {
                alert('Veuillez entrer une année valide. Entre 2000 et 2100.');
                return;
            }else{
                // Mise à jour de l'année de concours
                try {
                    const { error } = await supabase
                        .from('mjg_promc')
                        .update({ annee: data.annee })
                        .eq('id', data.id);

                    if (error) {
                        throw error;
                    }
                    alert('Année de concours modifiée avec succès.');
                } catch (error) {
                    console.error('Erreur lors de la modification de l\'année de concours:', error);
                    alert('Une erreur est survenue lors de la modification de l\'année de concours.');
                }
                }
            
        },

        // Méthode pour souscrire aux changements en temps réel
        subscribeToPromotions() {
            this.realtimeStore.subscribeToTable('mjg_promc','anneeCan',this)
        },

    },
    async mounted() {
        await this.get_annees_concours();
        this.subscribeToPromotions();
    },
    beforeUnmount() {
    // Nettoyer la souscription
    this.realtimeStore.unsubscribeFromTable('mjg_promc');
},
};
</script>