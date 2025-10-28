<template>
    <LoadingComponent v-if="isLoading" dataload="des stages" />
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
        
        <TableComponent :columns="label_but_dev_tab === 'Développer' ? columns2 : columns" :rows="stages">
            <template #actions="{ item }">
                <TableAction :id="item.id" title="le stage" :view_but_del="false" :notSuppr="true" tableEdit="mgj_infoc" @mod_data="dataInitialFormMod">
                    <template #form_modifier>
                        <FormComponent :inputs="input_mod" label_button="Modifier" @submit="modStage"/>
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
    name: 'InternshipList',
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
            stages: [],
            columns: [
                { key: 'rang', label: 'Matricule', style: 'min-width: 150px' },
                { key: 'nom', label: 'Nom et Prénom', style: 'min-width: 250px' ,etat:true},
                { key: 'filiere', label: 'Filière', style: 'min-width: 100px' },
                { key: 'stage1', label: 'Stage 1', style: 'min-width: 150px' },
                { key: 'debut1', label: 'Début 1', style: 'min-width: 150px' },
                { key: 'fin1', label: 'Fin 1', style: 'min-width: 150px' },
                { key: 'stage2', label: 'Stage 2', style: 'min-width: 150px' },
                { key: 'debut2', label: 'Début 2', style: 'min-width: 150px' },
                { key: 'fin2', label: 'Fin 2', style: 'min-width: 150px' },
                { key: 'stage3', label: 'Stage 3', style: 'min-width: 150px' },
                { key: 'debut3', label: 'Début 3', style: 'min-width: 150px' },
                { key: 'fin3', label: 'Fin 3', style: 'min-width: 150px' },
                { key: 'stage4', label: 'Stage 4', style: 'min-width: 150px' },
                { key: 'debut4', label: 'Début 4', style: 'min-width: 150px' },
                { key: 'fin4', label: 'Fin 4', style: 'min-width: 150px' },
                { key: 'stage5', label: 'Stage 5', style: 'min-width: 150px' },
                { key: 'debut5', label: 'Début 5', style: 'min-width: 150px' },
                { key: 'fin5', label: 'Fin 5', style: 'min-width: 150px' },
                { key: 'stage6', label: 'Stage 6', style: 'min-width: 150px' },
                { key: 'debut6', label: 'Début 6', style: 'min-width: 150px' },
                { key: 'fin6', label: 'Fin 6', style: 'min-width: 150px' },
                { key: 'commentaire', label: 'Commentaire', style: 'min-width: 250px' },
            ],
            columns2: [
                { key: 'rang', label: 'Matricule', style: 'min-width: 70px' },
                { key: 'nom', label: 'Nom et Prénom', style: 'min-width: 250px' },
                { key: 'filiere', label: 'Filière', style: 'min-width: 100px' },
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
                { id: 'stage1', type: 'text', label: 'Stage 1', placeholder: 'Entrez le lieu/entreprise du stage 1', initialValue: this.initialValues.stage1, required: false },
                { id: 'debut1', type: 'date', label: 'Date de début', initialValue: this.initialValues.debut1, required: false },
                { id: 'fin1', type: 'date', label: 'Date de fin', initialValue: this.initialValues.fin1, required: false },
                { id: 'stage2', type: 'text', label: 'Stage 2', placeholder: 'Entrez le lieu/entreprise du stage 2', initialValue: this.initialValues.stage2, required: false },
                { id: 'debut2', type: 'date', label: 'Date de début', initialValue: this.initialValues.debut2, required: false },
                { id: 'fin2', type: 'date', label: 'Date de fin', initialValue: this.initialValues.fin2, required: false },
                { id: 'stage3', type: 'text', label: 'Stage 3', placeholder: 'Entrez le lieu/entreprise du stage 3', initialValue: this.initialValues.stage3, required: false },
                { id: 'debut3', type: 'date', label: 'Date de début', initialValue: this.initialValues.debut3, required: false },
                { id: 'fin3', type: 'date', label: 'Date de fin', initialValue: this.initialValues.fin3, required: false },
                { id: 'stage4', type: 'text', label: 'Stage 4', placeholder: 'Entrez le lieu/entreprise du stage 4', initialValue: this.initialValues.stage4, required: false },
                { id: 'debut4', type: 'date', label: 'Date de début', initialValue: this.initialValues.debut4, required: false },
                { id: 'fin4', type: 'date', label: 'Date de fin', initialValue: this.initialValues.fin4, required: false },
                { id: 'stage5', type: 'text', label: 'Stage 5', placeholder: 'Entrez le lieu/entreprise du stage 5', initialValue: this.initialValues.stage5, required: false },
                { id: 'debut5', type: 'date', label: 'Date de début', initialValue: this.initialValues.debut5, required: false },
                { id: 'fin5', type: 'date', label: 'Date de fin', initialValue: this.initialValues.fin5, required: false },
                { id: 'stage6', type: 'text', label: 'Stage 6', placeholder: 'Entrez le lieu/entreprise du stage 6', initialValue: this.initialValues.stage6, required: false },
                { id: 'debut6', type: 'date', label: 'Date de début', initialValue: this.initialValues.debut6, required: false },
                { id: 'fin6', type: 'date', label: 'Date de fin', initialValue: this.initialValues.fin6, required: false },
                { id: 'commentaire', type: 'textarea', label: 'Commentaire', placeholder: 'Entrez les commentaires', initialValue: this.initialValues.commentaire, required: false }
            ];
        },
    },
    watch: {
        'selectPromStore.promotion_selected': {
            handler() {
                this.debouncedGetStages();
            },
            immediate: true,
        },
    },
    methods: {
        async getFirstStages() {
            this.isLoading = true;
            await this.getStages();
        },
        async getStages() {
            try {
                const { data, error } = await supabase
                    .from('mgj_infoc')
                    .select('id, rang, nom, filiere, stage1, debut1, fin1, stage2, debut2, fin2, stage3, debut3, fin3, stage4, debut4, fin4, stage5, debut5, fin5, stage6, debut6, fin6, commentaire')
                    .eq('prom_ele', this.selectPromStore.promotion_selected)
                    .order('rang', { ascending: false });
                if (error) throw error;
                
                this.stages = data;
                this.isLoading = false;
            } catch (error) {
                console.error('Erreur lors de la récupération des stages:', error);
                this.stages = [];
                this.isLoading = false;
            }
        },
        debouncedGetStages: debounce(function () {
            this.getStages();
        }, 300),
        async filtrer() {
            if (this.texteRecherche === '') {
                this.getStages();
                return;
            }
            try {
                const query = supabase
                    .from('mgj_infoc')
                    .select('id, rang, nom, filiere, stage1, debut1, fin1, stage2, debut2, fin2, stage3, debut3, fin3, stage4, debut4, fin4, stage5, debut5, fin5, stage6, debut6, fin6, commentaire')
                    .eq('prom_ele', this.selectPromStore.promotion_selected)
                    .order('id', { ascending: false });
                
                if (this.critereRecherche === 'nom') {
                    query.ilike('nom', `%${this.texteRecherche}%`);
                } else {
                    query.eq(this.critereRecherche, this.texteRecherche.toUpperCase());
                }
                
                const { data, error } = await query;
                if (error) throw error;

                this.stages = data;
            } catch (error) {
                console.error('Erreur lors de la recherche des stages:', error);
                this.stages = [];
            }
        },
        dev_tab() {
            this.label_but_dev_tab = this.label_but_dev_tab === 'Développer' ? 'Réduire' : 'Développer';
            this.tool = this.label_but_dev_tab === 'Développer' ? 'Développer le tableau' : 'Réduire le tableau';
        },
        async getFiliere() {
            try {
                const { data, error } = await supabase
                    .from('mjg_filiere')
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
        async modStage(data) {
            try {
                // Copie propre des données et nettoyage des chaînes vides car une date null n'est pas acceptée par Supabase
                const cleanedData = { ...data };
                for (const key in cleanedData) {
                if (cleanedData[key] === '') {
                    cleanedData[key] = null;
                }
                }

                const { error } = await supabase
                .from('mgj_infoc')
                .update(cleanedData)
                .eq('id', this.initialValues.id);

                if (error) throw error;

                alert('Stage modifié avec succès !');
            } catch (error) {
                console.error('Erreur lors de la modification du stage:', error);
                alert('Erreur lors de la modification du stage.');
            }
        },
        subscribeToTable() {
            this.realtimeStore.subscribeToTable('mgj_infoc', 'stages', this);
        },
        exportToExcel() {
            const worksheetData = this.stages.map(item => {
                const row = {};
                this.columns.forEach(col => {
                    if (col.key === 'debut1' || col.key === 'debut2' || col.key === 'debut3' || col.key === 'debut4' || col.key === 'debut5' || col.key === 'debut6' || col.key === 'fin1' || col.key === 'fin2' || col.key === 'fin3' || col.key === 'fin4' || col.key === 'fin5' || col.key === 'fin6') {
                        //let nbrStage = 0;
                        row[col.label] = item[col.key] ? new Date(item[col.key]).toLocaleDateString('fr-FR') : '';
                        //nbrStage++;

                    } else {
                        row[col.label] = item[col.key] || '';
                    }
                });
                return row;
            });
            const ws = XLSX.utils.json_to_sheet(worksheetData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Stages');
            const fileName = 'Stages.xlsx';
            XLSX.writeFile(wb, fileName);
        },
        
    },
    async mounted() {
        this.subscribeToTable();
        await this.getFiliere();
    },
    beforeUnmount() {
        this.realtimeStore.unsubscribeFromTable('mgj_infoc', 'stages');
    },
};
</script>