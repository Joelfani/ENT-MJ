<template>
    <LoadingComponent v-if="isLoading" dataload="des paiements" />
    <div v-else>
        <div class="header-title-table">
            <div class="">
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
        {{ initialCtg }}
        <TableComponent :columns="label_but_dev_tab === 'Développer' ? columns2 : columns" :rows="filteredRows">
            <template #actions="{ item }">
                <TableAction :id="item.id" title="ou enregistrer un paiement" table-suppr="payment" :notSuppr="true" :view_but_mod="false" :neutre_but="true" label_neutre_but="Modifier" btn_neutre_class="btn-primary" btn_neutre_modal="mod" @btn_neutre_click="dataInitialFormMod(initialCtg,initialAnnee,initialMois,item.id)" @loadData="loadData"  :mini_title="item.nom">
                    <template #form_modifier>
                        <FormComponent :inputs="input_mod" label_button="Modifier / Enregistrer" @submit="modPaiement" :parent="true" @dataform="dataformMod"/>
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
import * as XLSX from "xlsx";
import { debounce } from 'lodash';

export default {
    name: 'PaymentTable',
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
            eleves: [],
            paiements: [],
            mois: ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'],
            categories: [
                { key: 'ecolage', label: 'Ecolage 1A', annee: 1 },
                { key: 'cantine', label: 'Cantine 1A', annee: 1 },
                { key: 'ecolage', label: 'Ecolage 2A', annee: 2 },
                { key: 'cantine', label: 'Cantine 2A', annee: 2 },
            ],
            columns: [],
            columns2: [
                { key: 'rang', label: 'Matricule', style: 'min-width: 150px' },
                { key: 'nom', label: 'Nom et Prénom', style: 'min-width: 250px' },
                { key: 'filiere', label: 'Filière', style: 'min-width: 100px' },
            ],
            label_but_dev_tab: 'Développer',
            tool: 'Développer le tableau',
            initialValues: {},
            initialId: null,
            initialCtg: 'ecolage',
            initialAnnee: 1,
            initialMois: 'janvier',
            initialMontant: null,

            test: null,
        };
    },
    computed: {
        ...mapStores(useUserStore, useSubscribeStore, selectPromStore),
        filteredRows() {
            return this.eleves.map(eleve => {
                const row = { id: eleve.id, rang: eleve.rang, nom: eleve.nom, filiere: eleve.filiere };
                this.categories.forEach(cat => {
                    this.mois.forEach(moisItem => {
                        const key = `${cat.key}_${cat.annee}_${moisItem}`;
                        row[key] = this.getPaiement(eleve.id, cat.key, cat.annee, moisItem);
                    });
                });
                return row;
            });
        },
        input_mod() {
            return [
                { id: 'categorie', type: 'select', label: 'Catégorie', initialValue: this.initialCtg, options: [
                    { value: 'ecolage', text: 'Écolage' },
                    { value: 'cantine', text: 'Cantine' },
                ], required: true },
                { id: 'annee', type: 'number', label: 'Année d\'étude', initialValue: this.initialAnnee, min: 1, max: 2, required: true },
                { id: 'mois', type: 'select', label: 'Mois', initialValue: this.initialMois , options: this.mois.map(m => ({ value: m, text: m.charAt(0).toUpperCase() + m.slice(1) })), required: true },
                { id: 'montant', type: 'number', label: 'Montant', initialValue: this.initialMontant, required: true },
            ];
        },
    },
    watch: {
        'selectPromStore.promotion_selected': {
            handler() {
                this.debouncedFetchData();
            },
            immediate: true,
        },
    },
    methods: {
        async fetchData() {
            this.isLoading = true;
            try {
                const { data: eleves, error: elevesError } = await supabase
                    .from('infoc')
                    .select('*')
                    .eq('prom_ele', this.selectPromStore.promotion_selected)
                    .order('rang', { ascending: false });
                if (elevesError) throw elevesError;

                const { data: paiements, error: paiementsError } = await supabase
                    .from('payment')
                    .select('*');
                if (paiementsError) throw paiementsError;

                this.eleves = eleves;
                this.paiements = paiements;
                this.updateColumns();
                this.isLoading = false;
            } catch (error) {
                console.error('Erreur lors de la récupération des données:', error);
                this.eleves = [];
                this.paiements = [];
                this.isLoading = false;
            }
        },
        debouncedFetchData: debounce(function () {
            this.fetchData();
        }, 300),
        updateColumns() {
            const dynamicColumns = this.categories.flatMap(cat => 
                this.mois.map(moisItem => ({
                    key: `${cat.key}_${cat.annee}_${moisItem}`,
                    label: `${cat.label} ${moisItem.charAt(0).toUpperCase() + moisItem.slice(1)}`,
                    style: 'min-width: 200px; text-align: center',
                }))
            );
            this.columns = [
                { key: 'rang', label: 'Matricule', style: 'min-width: 150px'},
                { key: 'nom', label: 'Nom et Prénom', style: 'min-width: 250px' ,etat: true},
                { key: 'filiere', label: 'Filière', style: 'min-width: 100px' },
                ...dynamicColumns,
            ];
        },
        getPaiement(eleveId, cat, annee, mois) {
            const p = this.paiements.find(pay => 
                pay.eleve_id === eleveId && 
                pay.categorie === cat && 
                pay.annee_etude === annee && 
                pay.mois === mois
            );
            return p ? p.montant : '';
        },
        async filtrer() {
            if (this.texteRecherche === '') {
                this.fetchData();
                return;
            }
            try {
                const query = supabase
                    .from('infoc')
                    .select('*')
                    .eq('prom_ele', this.selectPromStore.promotion_selected)
                    .order('rang', { ascending: false });
                
                if (this.critereRecherche === 'nom') {
                    query.ilike('nom', `%${this.texteRecherche}%`);
                } else {
                    query.eq(this.critereRecherche, this.texteRecherche.toUpperCase());
                }
                
                const { data, error } = await query;
                if (error) throw error;

                this.eleves = data;
            } catch (error) {
                console.error('Erreur lors de la recherche des élèves:', error);
                this.eleves = [];
            }
        },
        dev_tab() {
            this.label_but_dev_tab = this.label_but_dev_tab === 'Développer' ? 'Réduire' : 'Développer';
            this.tool = this.label_but_dev_tab === 'Développer' ? 'Développer le tableau' : 'Réduire le tableau';
        },
        async dataInitialFormMod(ctg, annee, mois, id) {
            this.initialId = id;
            try{
                const { data, error } = await supabase
                .from('payment')
                .select('*')
                .eq('ele_id', id)
                .eq('categorie', ctg)
                .eq('annee', annee)
                .eq('mois', mois)
                .single();
                this.initialMontant = data ? data.montant : '';
                if (error) throw error;
                
            } catch (error) {
                console.log('voici l id',id);
                console.log('Voici l ctg',ctg);
                console.log('Voici l annee',annee);
                console.log('Voici l mois',mois);
                console.log('le montant initial',this.initialMontant);
                
                
                console.error('Erreur lors de la modification du paiement:', error);
                alert('Erreur lors de la modification du paiement.');
            }
            
        },
        dataformMod(data) {
            const datas = data;
            this.dataInitialFormMod(datas.categorie, datas.annee, datas.mois, this.initialId);
        },
        async modPaiement(data) {
            try {
                const { error } = await supabase
                    .from('payment')
                    .update(data)
                    .eq('id', this.initialValues.id);
                if (error) throw error;
                
                alert('Paiement modifié avec succès !');
                this.fetchData();
            } catch (error) {
                console.error('Erreur lors de la modification du paiement:', error);
                alert('Erreur lors de la modification du paiement.');
            }
        },
        subscribeToTable() {
            this.realtimeStore.subscribeToTable('payment', 'paiements', this, 'id', 'desc');
        },
        exportToExcel() {
            const worksheetData = this.filteredRows.map(item => {
                const row = {};
                this.columns.forEach(col => {
                    row[col.label] = item[col.key] || '';
                });
                return row;
            });
            const ws = XLSX.utils.json_to_sheet(worksheetData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Paiements');
            XLSX.writeFile(wb, 'Paiements.xlsx');
        },
        loadData() {
            this.fetchData();
        },
    },
    async mounted() {
        this.subscribeToTable();
        await this.fetchData();
    },
    beforeUnmount() {
        this.realtimeStore.unsubscribeFromTable('payment', 'paiements');
    },
};
</script>

<style scoped>
.table-container {
    overflow-x: auto;
}
</style>