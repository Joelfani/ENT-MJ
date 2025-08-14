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
        
        <TableComponent :columns="label_but_dev_tab === 'Développer' ? columns2 : columns" :rows="filteredRows" :showActions="userStore.edit ? true : false">
            <template #actions="{ item }">

                <TableAction :id="item.id" title="ou enregistrer un paiement" table-suppr="payment" :notSuppr="true" :view_but_mod="false" :neutre_but="true" label_neutre_but="Modifier" btn_neutre_class="btn-primary" btn_neutre_modal="mod" @btn_neutre_click="dataInitialFormMod(ctg,annee,moisMod,item.id)" @loadData="loadData"  :mini_title="item.nom" :view_but_del="false">
                    <template #form_modifier >
                        <form class="form" @submit.prevent="modPaiement()">
                            <div class="form-group">
                                <label for="montant">Categories</label>
                                <select class="form-control" name="categorie" v-model="ctg">
                                    <option value="ecolage">Écolage</option>
                                    <option value="cantine">Cantine</option>
                                </select>
                                <label for="annee">Année</label>
                                <input type="number" class="form-control" name="annee" min="1" max="2" v-model="annee">
                                <label for="mois">Mois</label>
                                <select class="form-control" name="mois" v-model="moisMod">
                                    <option value="janvier">Janvier</option>
                                    <option value="fevrier">Fevrier</option>
                                    <option value="mars">Mars</option>
                                    <option value="avril">Avril</option>
                                    <option value="mai">Mai</option>
                                    <option value="juin">Juin</option>
                                    <option value="juillet">Juillet</option>
                                    <option value="aout">Aout</option>
                                    <option value="septembre">Septembre</option>
                                    <option value="octobre">Octobre</option>
                                    <option value="novembre">Novembre</option>
                                    <option value="decembre">Décembre</option>
                                </select>
                                <label for="montant">Montant</label>
                                <input type="number" class="form-control" name="montant" v-model="montant">
                            </div>
                            <button type="submit" class="btn btn-primary">Enregistrer / Modifier</button>
                            <button class="btn btn-light" data-dismiss="modal">Fermer</button>
                        </form>
                    </template>
                </TableAction>
            </template>
        </TableComponent>
    </div>
</template>

<script>
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
            idMod: null,
            ctg: 'ecolage',
            annee: 1,
            montant: null,
            moisMod: 'janvier',
            idPay: null,

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
                        const paiement = this.getPaiement(eleve.id, cat.key, cat.annee, moisItem);
                        row[key] = paiement ? paiement.montant : '';
                    });                    
                });
                return row;
            });
        },
    },
    watch: {
        'selectPromStore.promotion_selected': {
            handler() {
                this.debouncedecoData();                
            },
        },
        ctg() {
            this.dataInitialFormMod(this.ctg, this.annee, this.moisMod, this.idMod);
        },
        annee() {
            this.dataInitialFormMod(this.ctg, this.annee, this.moisMod, this.idMod);
        },
        moisMod() {
            this.dataInitialFormMod(this.ctg, this.annee, this.moisMod, this.idMod);
        },
    },
    methods: {
        async ecoData() {
            try {
                const { data: eleves, error: elevesError } = await supabase
                    .from('infoc')
                    .select('*')
                    .eq('prom_ele', this.selectPromStore.promotion_selected)
                    .order('rang', { ascending: false });
                if (elevesError) throw elevesError;

                const { data: paiements, error: paiementsError } = await supabase
                    .from('payment')
                    .select('*')
                    .order('id', { ascending: false });
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
        debouncedecoData: debounce(function () {
            this.ecoData();
        }, 300),
        updateColumns() {
            const dynamicColumns = this.categories.flatMap(cat => 
                this.mois.map(moisItem => ({
                    key: `${cat.key}_${cat.annee}_${moisItem}`,
                    label: `${cat.label} ${moisItem.charAt(0).toUpperCase() + moisItem.slice(1)}`,
                    style: 'min-width: 200px;',

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
            return this.paiements.find(pay => 
                pay.ele_id === eleveId && 
                pay.categorie === cat && 
                pay.annee === annee && 
                pay.mois === mois
            ) || null;
        },
        async filtrer() {
            if (this.texteRecherche === '') {
                this.ecoData();
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
            this.idMod = id;
            if(annee === 1 || annee === 2) {
                try{
                    const { data, error } = await supabase
                    .from('payment')
                    .select('*')
                    .eq('ele_id', id)
                    .eq('categorie', ctg)
                    .eq('annee', annee)
                    .eq('mois', mois)
                    .maybeSingle();
                    this.montant = data ? data.montant : 0;
                    this.idPay = data ? data.id : null;
                    if (error) throw error;
                } 
                catch (error) {
                    if (error.details !== 'The result contains 0 rows') {
                        console.error('Erreur lors de la recuperation des donnees:', error);
                        alert('Erreur lors de la recuperation des données.');
                    }
                }
            }
        },
        async modPaiement() {
            if (this.idPay) {
                try {
                    const { error } = await supabase
                        .from('payment')
                        .update({ montant: this.montant == '' ? null : this.montant})
                        .eq('id', this.idPay);
                    if (error) throw error;
                    try {
                        const {error} = await supabase
                        .from('pay_track')
                        .insert({
                            id_pay: this.idPay,
                            ele_id: this.idMod,
                            descriptif: this.ctg,
                            montant: this.montant == '' ? null : this.montant,
                            user: this.userStore.id
                        })
                        if (error) throw error;
                    } catch (error) {
                        console.error('Erreur lors de la récupération des données après modification:', error);
                    }
                    alert('Paiement modifié avec succès !');
                } catch (error) {
                    console.error('Erreur lors de la modification du paiement:', error);
                    alert('Erreur lors de la modification du paiement.');
                }
            }else {
                try {
                    const {data, error } = await supabase
                        .from('payment')
                        .insert({
                            ele_id: this.idMod,
                            categorie: this.ctg,
                            annee: this.annee,
                            mois: this.moisMod,
                            montant: this.montant == '' ? null : this.montant ,
                        })
                        .select('id')
                        .single();
                    if (error) throw error;
                    this.idPay = data.id;
                    await supabase
                        .from('pay_track')
                        .insert({
                            id_pay: this.idPay,
                            ele_id: this.idMod,
                            descriptif: this.ctg,
                            montant: this.montant == '' ? null : this.montant,
                            user: this.userStore.id
                        });

                    alert('Paiement enregistré avec succès !');
                    this.dataInitialFormMod(this.ctg, this.annee, this.moisMod, this.idMod);
                } catch (error) {
                    console.error('Erreur lors de l\'enregistrement du paiement:', error);
                    alert('Erreur lors de l\'enregistrement du paiement.');
                }
            }
        },
        subscribeToTable() {
            this.realtimeStore.subscribeToTable('payment', 'paiements', this);
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
            this.ecoData();
        },
    },
    async mounted() {
        this.subscribeToTable();
        await this.debouncedecoData();
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