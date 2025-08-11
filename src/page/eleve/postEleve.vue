<template>
    <LoadingComponent v-if="isLoading" dataload="des post-formations" />
    <div v-else>
        <div class="header-title-table">
            <div>
                <button class="btn btn-dark btn-table btn-lg" id="tool" data-toggle="tooltip" data-placement="left" :title="tool" @click="dev_tab()">{{ label_but_dev_tab }}</button>
                <button class="btn btn-light btn-lg" @click="exportToExcel">Exporter vers Excel</button>
            </div>
            <SearchInput 
                :rech="texteRecherche"
                :choix_rech="critereRecherche"
                :options="options"
                @update:rech="texteRecherche = $event"
                @update:choix_rech="critereRecherche = $event"
                @search="filtrer"
            />
        </div>
        
        <TableComponent :columns="label_but_dev_tab === 'Développer' ? columns2 : columns" :rows="postFormations">
            <template #actions="{ item }">
                <TableAction :id="item.id" title="la post-formation" :view_but_del="false" :notSuppr="true" tableEdit="infoc" @mod_data="dataInitialFormMod">
                    <template #form_modifier>
                        <FormComponent :inputs="input_mod" label_button="Modifier" @submit="modPostFormation"/>
                    </template>
                </TableAction>
            </template>
        </TableComponent>
    </div>
</template>

<script>
import FormComponent from '@/components/formComponent.vue';
import LoadingComponent from '@/components/loadingComponent.vue';
import TableAction from '@/components/TableAction.vue';
import TableComponent from '@/components/TableComponent.vue';
import SearchInput from '@/components/SearchInput.vue';
import { useSubscribeStore } from '@/store/realtime';
import { useUserStore } from '@/store/user';
import { selectPromStore } from '@/store/selectProm';
import { supabase } from '@/supabase';
import { mapStores } from 'pinia';
import * as XLSX from 'xlsx';
import { debounce } from 'lodash';

export default {
    name: 'PostFormationList',
    components: {
        TableComponent,
        LoadingComponent,
        TableAction,
        FormComponent,
        SearchInput,
    },
    data() {
        return {
            isLoading: true,
            texteRecherche: '',
            critereRecherche: 'rang',
            data_before_search: [],
            options: [
                { value: 'rang', label: 'Matricule' },
                { value: 'nom', label: 'Nom et Prénom' },
                { value: 'filiere', label: 'Filière' },
            ],
            postFormations: [],
            columns: [
                { key: 'rang', label: 'Matricule', style: 'min-width: 150px' },
                { key: 'nom', label: 'Nom et Prénom', style: 'min-width: 250px', etat: true },
                { key: 'filiere', label: 'Filière', style: 'min-width: 100px' },
                { key: 'statut_post', label: 'Statut Post-Formation', style: 'min-width: 200px' },
                { key: 'secteur_emploi', label: 'Secteur d\'Emploi', style: 'min-width: 150px' },
                { key: 'duree_rech', label: 'Durée de Recherche d\'Emploi', style: 'min-width: 250px' },
                { key: 'nom_entreprise', label: 'Nom de l\'Entreprise', style: 'min-width: 200px' },
                { key: 'type_entreprise', label: 'Type d\'Entreprise', style: 'min-width: 150px' },
                { key: 'formalisation', label: 'Formalisation', style: 'min-width: 150px' },
                { key: 'type_contrat', label: 'Type de Contrat', style: 'min-width: 150px' },
                { key: 'niv_salaire', label: 'Niveau de Salaire', style: 'min-width: 150px' },
            ],
            columns2: [
                { key: 'rang', label: 'Matricule', style: 'min-width: 70px' },
                { key: 'nom', label: 'Nom et Prénom', style: 'min-width: 250px' },
                { key: 'filiere', label: 'Filière', style: 'min-width: 100px' },
                { key: 'statut_post', label: 'Statut Post-Formation', style: 'min-width: 150px' },
                { key: 'secteur_emploi', label: 'Secteur d\'Emploi', style: 'min-width: 150px' },
                { key: 'duree_rech', label: 'Durée de Recherche d\'Emploi', style: 'min-width: 150px' },

            ],
            label_but_dev_tab: 'Développer',
            tool: 'Développer le tableau',
            initialValues: {},
            filiere: [],
        };
    },
    computed: {
        ...mapStores(useUserStore, useSubscribeStore, selectPromStore),
        input_mod() {
            return [
                { id: 'rang', type: 'number', label: 'Matricule', placeholder: 'Entrez le matricule', initialValue: this.initialValues.rang, disabled: true },
                { id: 'nom', type: 'text', label: 'Nom et Prénom', placeholder: 'Entrez le nom et prénom', initialValue: this.initialValues.nom, disabled: true },
                { id: 'filiere', type: 'select', label: 'Filière', placeholder: 'Entrez la filière', initialValue: this.initialValues.filiere,
                    options: this.filiere.map(item => ({
                        value: item.nom,
                        text: item.nomlong
                    })),
                    disabled: true
                },
                { id: 'statut_post', type: 'select', label: "Statut Post-Formation", initialValue: this.initialValues.statut_post, options: [
                    { value: "En cours d'études", text: 'En cours d\'etudes' }, 
                    { value: "Employé", text: 'Employé' },
                    { value: 'Auto emploi', text: 'Auto emploi' },
                    { value: 'En recherche d\'emploi', text: 'En recherche d\'emploi' },
                    { value: 'Autre', text: 'Autre' }
                ]},
                { id: 'duree_rech', type: 'text', label: 'Durée de Recherche d\'Emploi', placeholder: 'Entrez la durée de recherche', initialValue: this.initialValues.duree_rech, required: false },
                { id: 'secteur_emploi', type: 'select', label: "Secteur d'Emploi", initialValue: this.initialValues.secteur_emploi, options: [
                    { value: "THR", text: 'THR' }, 
                    { value: "Commerce", text: 'Commerce' },
                    { value: 'Agriculture et élevage', text: 'Agriculture et élevage' },
                    { value: 'En recherche d\'emploi', text: 'En recherche d\'emploi' },
                    { value: 'Artisanats', text: 'Artisanats' }, 
                    { value: 'Pêche', text: 'Pêche' },
                    { value: 'Autre', text: 'Autre' }
                ]},
                { id: 'nom_entreprise', type: 'text', label: 'Nom de l\'Entreprise', placeholder: 'Entrez le nom de l\'entreprise', initialValue: this.initialValues.nom_entreprise, required: false },

                { id: 'type_entreprise', type: 'select', label: "Type d'Entreprise", initialValue: this.initialValues.type_entreprise, options: [
                    { value: "THR", text: 'THR' }, 
                    { value: "Commerce", text: 'Commerce' },
                    { value: 'Hotel ou Restaurant indépendant', text: 'Hotel ou Restaurant indépendant' },
                    { value: 'Hotel ou Restaurant - chaîne', text: 'Hotel ou Restaurant - chaîne' },
                    { value: 'Restauration collective', text: 'Restauration collective' }, 
                    { value: 'PME', text: 'PME' },
                    { value: 'ONG, Association', text: 'ONG, Association' },
                    { value: 'Etablissement public', text: 'Etablissement public' },
                    { value: 'Autre', text: 'Autre' }
                ]},

                { id: 'formalisation', type: 'select', label: "Formalisation", initialValue: this.initialValues.formalisation, options: [
                    { value: "Temps plein", text: 'Temps plein' }, 
                    { value: "Commerce", text: 'Commerce' },
                    { value: 'Agriculture et élevage', text: 'Agriculture et élevage' },
                    { value: 'Artisanats', text: 'Artisanats' }, 
                    { value: 'Pêche', text: 'Pêche' },
                    { value: 'Autre', text: 'Autre' }
                ]},

                { id: 'type_contrat', type: 'select', label: "Type de Contrat", initialValue: this.initialValues.type_contrat, options: [
                    { value: "CDD", text: 'CDD' }, 
                    { value: "CDI", text: 'CDI' },
                    { value: 'Contrat saisonier', text: 'Contrat saisonier' },
                    { value: 'Prestataire', text: 'Prestataire' }, 
                    { value: 'Accord verbal', text: 'Accord verbal' },
                ]},
                { id: 'niv_salaire', type: 'select', label: "Niveau de Salaire", initialValue: this.initialValues.niv_salaire, options: [
                    { value: "150 000 Ar - 200 000 Ar", text: '150 000 Ar - 200 000 Ar' }, 
                    { value: "200 000 Ar - 300 000 Ar", text: '200 000 Ar - 300 000 Ar' },
                    { value: '> 300 000 Ar', text: '> 300 000 Ar' },
                ]},
                
            ];
        },
    },
    watch: {
        'selectPromStore.promotion_selected': {
            handler() {
                this.debouncedGetPostFormations();
            },
        },
    },
    methods: {
        async getFirstPostFormation() {
            this.isLoading = true;
            await this.getPostFormations();
        },
        async getPostFormations() {
            
            try {
                const { data, error } = await supabase
                    .from('infoc')
                    .select('id, rang, nom, filiere, statut_post, duree_rech, secteur_emploi, nom_entreprise, situation, type_entreprise, formalisation, type_contrat, niv_salaire')
                    .eq('prom_ele', this.selectPromStore.promotion_selected)
                    .order('rang', { ascending: false });
                if (error) throw error;
                
                this.postFormations = data;
                this.isLoading = false;
            } catch (error) {
                console.error('Erreur lors de la récupération des post-formations:', error);
                this.postFormations = [];
                this.isLoading = false;
            }
        },
        debouncedGetPostFormations: debounce(function () {
            this.getFirstPostFormation();
        }, 300),
        async filtrer() {
            if (this.texteRecherche === '') {
                this.getPostFormations();
                return;
            }
            try {
                const query = supabase
                    .from('infoc')
                    .select('id, rang, nom, filiere, statut_post, duree_rech, secteur_emploi, nom_entreprise, situation, type_entreprise, formalisation, type_contrat, niv_salaire')
                    .eq('prom_ele', this.selectPromStore.promotion_selected)
                    .order('id', { ascending: false });
                
                if (this.critereRecherche === 'nom') {
                    query.ilike('nom', `%${this.texteRecherche}%`);
                } else {
                    query.eq(this.critereRecherche, this.texteRecherche.toUpperCase());
                }
                
                const { data, error } = await query;
                if (error) throw error;

                this.postFormations = data;
            } catch (error) {
                console.error('Erreur lors de la recherche des post-formations:', error);
                this.postFormations = [];
            }
        },
        dev_tab() {
            this.label_but_dev_tab = this.label_but_dev_tab === 'Développer' ? 'Réduire' : 'Développer';
            this.tool = this.label_but_dev_tab === 'Développer' ? 'Développer le tableau' : 'Réduire le tableau';
        },
        async getFiliere() {
            try {
                const { data, error } = await supabase
                    .from('filiere')
                    .select('*')
                    .order('id', { ascending: true });
                if (error) throw error;
                this.filiere = data;
            } catch (error) {
                console.error('Erreur lors de la récupération des filières:', error);
                this.filiere = [];
            }
        },
        dataInitialFormMod(item) {
            this.initialValues = item;
        },
        async modPostFormation(data) {
            try {
                const cleanedData = { ...data };
                for (const key in cleanedData) {
                    if (cleanedData[key] === '') {
                        cleanedData[key] = null;
                    }
                }

                const { error } = await supabase
                    .from('infoc')
                    .update(cleanedData)
                    .eq('id', this.initialValues.id);

                if (error) throw error;

                alert('Information sur la post-formation modifiée avec succès !');
            } catch (error) {
                console.error('Erreur lors de la modification de la post-formation:', error);
                alert('Erreur lors de la modification de la post-formation.');
            }
        },
        subscribeToTable() {
            this.realtimeStore.subscribeToTable('infoc', 'postFormations', this);
        },
        exportToExcel() {
            const worksheetData = this.postFormations.map(item => {
                const row = {};
                this.columns.forEach(col => {
                    row[col.label] = item[col.key] || '';
                });
                return row;
            });
            const ws = XLSX.utils.json_to_sheet(worksheetData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Post-Formations');
            const fileName = 'PostFormations.xlsx';
            XLSX.writeFile(wb, fileName);
        },
    },
    async mounted() {
        this.subscribeToTable();
        await this.getFiliere();
        this.debouncedGetPostFormations();
    },
    beforeUnmount() {
        this.realtimeStore.unsubscribeFromTable('infoc', 'postFormations');
    },
};
</script>