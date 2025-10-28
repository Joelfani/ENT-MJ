<template>
<LoadingComponent v-if="isLoading" dataload="des promotions" />
<div v-else>
    <a v-if="userStore.add" class="btn btn-success btn-lg" data-toggle="modal" data-target="#add_promotion"> Ajouter </a>

    <TableComponent :columns="columns" :rows="promotions">
    <template #actions="{ item }">
        <TableAction :id="item.id" title="la promotion" table-suppr="mgj_promotion" tableEdit="mjg_promotion" @mod_data="dataInitialFormMod">
            <template #form_modifier>
                <FormComponent :inputs="input_mod" label_button="Modifier" @submit="mod_promotion"/>
            </template>
        </TableAction>
    </template>
    </TableComponent>

    <!--Modal for adding a new promotion--->

    <ModalComponent id="add_promotion" title="Ajouter une promotion">
        <FormComponent :inputs="input_add" label_button="Ajouter" @submit="add_promotion"/>
    </ModalComponent>
</div>
</template>

<script>
import LoadingComponent from '@/components/loadingComponent.vue';
import TableAction from '@/components/TableAction.vue';
import TableComponent from '@/components/TableComponent.vue';
import { useUserStore } from '@/store/user';
import { mapStores } from 'pinia';
import { supabase } from '@/supabase';
import FormComponent from '@/components/formComponent.vue';
import ModalComponent from '@/components/ModalComponent.vue';
import { useSubscribeStore } from '@/store/realtime';

export default {
name: 'PromotionEleve',
components: {
    TableComponent,
    LoadingComponent,
    TableAction,
    FormComponent,
    ModalComponent,
},
data() {
    return {
    columns: [
        { key: 'name', label: 'Nom de la promotion' },
        { key: 'annee1', label: "Première année d'étude" },
        { key: 'annee2', label: "Deuxième année d'étude" },
    ],
    isLoading: true,
    promotions: [],
    subscription: null, // Stocker la souscription

    //data pour le formulaire de modification
        initialValues: {},

    add_initialValue: {
        name: '',
        annee1: null,
        annee2: null,
    }, // Valeur initiale pour le formulaire d'ajout
    };
    
},
computed: {
    ...mapStores(useUserStore,useSubscribeStore),

    input_add() {
        return [
        { id: 'name', type: 'text', label: 'Nom de la promotion', placeholder: 'Entrez le nom de la promotion',initialValue: this.add_initialValue.name, required: true },
        { id: 'annee1', type: 'number', label: "Première année d'étude", placeholder: "Entrez la première année d'étude",initialValue: this.add_initialValue.annee1, required: true },
        { id: 'annee2', type: 'number', label: "Deuxième année d'étude", placeholder: "Entrez la deuxième année d'étude",initialValue: this.add_initialValue.annee2, required: true },
        ];
    },
    input_mod() {
        return [
        { id: 'id', type: 'hidden', initialValue: this.initialValues.id },
        { id: 'name', type: 'text', label: 'Nom de la promotion', placeholder: 'Entrez le nom de la promotion',initialValue: this.initialValues.name, required: true },
        { id: 'annee1', type: 'number', label: "Première année d'étude", placeholder: "Entrez la première année d'étude",initialValue: this.initialValues.annee1, required: true },
        { id: 'annee2', type: 'number', label: "Deuxième année d'étude", placeholder: "Entrez la deuxième année d'étude",initialValue: this.initialValues.annee2, required: true },
        ];
    },
},
methods: {
    async getPromotions() {
    try {
        const { data } = await supabase
        .from('mjg_promotion')
        .select('*')
        .order('id', { ascending: false });

        this.promotions = data || [];
        this.isLoading = false;
    } catch (error) {
        console.error('Erreur lors de la récupération des promotions:', error);
        this.promotions = [];
        this.isLoading = false;
    }
    },

    // Méthodes pour ajouter une promotion
    async add_promotion(data) {
        const doubleData = await supabase
            .from('mjg_promotion')
            .select('*')
            .eq('name', data.name)
        if( doubleData.data.length > 0) {
            alert('Cette promotion existe déjà !');
            return;
        }else if (data.annee1 < 1900 || data.annee2 < 1900 || data.annee1 > 2100 || data.annee2 > 2100) {
            alert('Les années doivent être supérieures à 1900 !');
            return;
        }else if (data.annee1 >= data.annee2) {
            alert('La première année doit être inférieure à la deuxième année !');
            return;
        }else{
            try {
            const { error } = await supabase
                .from('mjg_promotion')
                .insert({
                name: data.name,
                annee1: data.annee1,
                annee2: data.annee2,
                });

            if (error) {
                throw error;
            }

            alert('Promotion ajoutée avec succès !');
            this.add_initialValue = {
                name: '',
                annee1: null,
                annee2: null,
            }; // vider le formulaire d'ajout
            
            } catch (error) {
            console.error('Erreur lors de l\'ajout de la promotion:', error);
            }
        }
        
    },

    // Méthodes pour modifier une promotion

    dataInitialFormMod(data) {
        // Initialiser le formulaire de modification avec les données de la promotion
        this.initialValues = data;
    },
    async mod_promotion(data) {
        const doubleData = await supabase
            .from('mjg_promotion')
            .select('*')
            .eq('name', data.name)
        if( doubleData.data.length > 0 && doubleData.data[0].id !== data.id) {
            alert('Cette promotion existe déjà !');
            return;
        }else if (data.annee1 < 1900 || data.annee2 < 1900 || data.annee1 > 2100 || data.annee2 > 2100) {
            alert('Les années doivent être supérieures à 1900 !');
            return;
        }else if (data.annee1 >= data.annee2) {
            alert('La première année doit être inférieure à la deuxième année !');
            return;
        }else{
            try {
                    const { error } = await supabase
                        .from('mjg_promotion')
                        .update({
                        name: data.name,
                        annee1: data.annee1,
                        annee2: data.annee2,
                        })
                        .eq('id', data.id);
                        alert('Promotion modifiée avec succès !');
                    if (error) {
                        throw error;
                    }
                    } catch (error) {
                    console.error('Erreur lors de la modification de la promotion:', error);
                    }
        }
    },

    // Méthode pour souscrire aux changements en temps réel
    subscribeToPromotions() {
        this.realtimeStore.subscribeToTable('mjg_promotion','promotions',this)
    },


},
async mounted() {
    await this.getPromotions();
    this.subscribeToPromotions();
},
beforeUnmount() {
    // Nettoyer la souscription
    this.realtimeStore.unsubscribeFromTable('mjg_promotion');
},
};
</script>