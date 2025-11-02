<template>
    <!-- Navigation Bar -->
    <div class="container-fluid">
        <div class="row">
            <div class="brand-place centre">
                    <div class="enterprise_logo"></div>
            </div>
            <nav class="mynavbar">
                    <div class="title-head-container centre">
                    <span class="nav-header-title">{{ titre_contenu }}</span>
                    </div>
                    <div class="container-deconnexion">
                    <span>Utilisateur : {{ user }}</span>
                    <button class="btn btn-dark" style="margin-left: 20px;" @click="logout">Déconnexion</button>
                    </div>
            </nav>
        </div>
    </div>
    <!-- Sidebar Navigation-->
    <div class="myBarNav">
        <div id="mySidenav" class="sidenav">
        <div class="menu_side">
                <nav>
                <ul id="menu">
                    <li v-for="menu in menuItems" :key="menu.title">
                        <RouterLink
                            :to="!menu.subItems ? '/HomePage/'+menu.view : ''"
                            class="myBox"
                            :class="{ 'dropdown-toggle': menu.subItems, 'selectedMenu': !menu.subItems && selected === menu.view}"
                            :data-toggle="menu.subItems ? 'collapse' : null"
                            :data-target="menu.subItems ? `#${menuId(menu.title)}` : null"
                            :title="menu.title"
                            @click="!menu.subItems ? changeClass(menu.view , menu.title_view) : null"
                        >
                            <div :class="`box centre ${menu.icon}`"></div>
                            {{ menu.title }}
                        </RouterLink>
                        <ul
                            v-if="menu.subItems"
                            :id="menuId(menu.title)"
                            class="collapse"
                            data-parent="#menu"
                        >
                            <li v-for="subItem in menu.subItems" :key="subItem.title">
                                <RouterLink
                                    v-if="!subItem.modal"
                                    :to="userStore[subItem.acces] ? '/HomePage/'+subItem.view: ''"
                                    class="myBox"
                                    data-toggle="modal"
                                    :data-target="userStore[subItem.acces] ? '': '#UNACCESS'"
                                    :class="{'selectedMenu': selected === subItem.view}"
                                    :title="subItem.title"
                                    @click="changeClass(subItem.view,subItem.title_view)"
                                >
                                    <div :class="`sub_box centre ${subItem.icon || menu.icon}`"></div>
                                    {{ subItem.title }}
                                </RouterLink>
                                <a 
                                    v-if="subItem.modal"
                                    href="#"
                                    class="myBox"
                                    :class="{'selectedMenu': selected === subItem.view}"
                                    data-toggle="modal"
                                    :data-target="userStore[subItem.acces] ? '#'+subItem.modal : '#UNACCESS'"
                                    :title="subItem.title"
                                    @click="changeClass(subItem.view)">
                                    <div :class="`sub_box centre ${subItem.icon || menu.icon}`"></div>
                                    {{ subItem.title}}
                                </a>
                    

                            </li>
                        </ul>
                    </li>
                </ul>
                </nav>
        </div>
        </div>
        </div>
        <!-- Main Content 
        <div class="view_board container-fluid">
                <div class="first-view" v-if="!selected"></div>
        </div>-->

        <!-- Modal pour choix de promotion -->
        <div>
            
        </div>
        <div v-for="menu in menuItems" :key="menu.title">
            <div v-for="subItem in menu.subItems" :key="subItem.title">
                <ModalComponent
                v-if="subItem.modal"
                :id="subItem.modal"
                :title="subItem.modal_title"
                >
                <div>
                    <label for="">Selection de la promotion</label>
                    <div class="select-promotion">
                        <select v-if="menu.title != 'Candidats'" class="form-control" name="prom" v-model="selected_prom">
                            <option v-for="prom in promotions" :key="prom.id" :value="prom.id">{{ prom.name }}</option>
                        </select>
                        <select v-if="menu.title == 'Candidats'" class="form-control" name="annee" v-model="selected_annee">
                            <option v-for="annee in annees" :key="annee.id" :value="annee.id">{{ annee.annee }}</option>
                        </select>
                        <RouterLink
                            :to="'/HomePage/'+subItem.view"
                            type="submit" 
                            class="btn btn-dark btn-confirm" 
                            data-dismiss="modal" 
                            @click="changeClass(subItem.title, subItem.title_view,selected_prom, selected_annee)">
                            Confirmer
                        </RouterLink>
                    </div>
                </div>
                </ModalComponent>
            </div>
        </div>
        <!-- Modal pour refus d'acces -->
        <ModalComponent title="NOTIFICATION D'ACCES" id="UNACCESS">
            <h3 style="font-weight: bold; color: red;">ACCES NON AUTORISER</h3>
            <hr>
            <button class="btn btn-danger" data-dismiss="modal">Fermer</button>
        </ModalComponent>
</template>
<script>
import { supabase } from '@/supabase';
import { RouterLink } from 'vue-router';
import ModalComponent from '@/components/ModalComponent.vue';
import { mapStores } from 'pinia';
import { useSubscribeStore } from '@/store/realtime';
import { selectPromStore } from '@/store/selectProm';
import { useUserStore } from '@/store/user';
export default{
    name:'NavBar_component',
    props: {
        user: String    
    },
    components:
    {
        RouterLink,
        ModalComponent,
    },
    data(){
        return{
            menuItems:[
                {
                        title: 'Tableau de bord',
                        icon: 'icon-dashboard',
                        subItems: [
                            {
                            title: 'Finance',
                            modal: 'mdl-ask-tdb-finance',
                            modal_title: 'TABLEAU DE BORD POUR LES FINANCES',
                            title_view: 'TABLEAU DE BORD POUR LES FINANCES',
                            view: 'tdb_fin',
                            icon: 'icon-finance'
                            },
                            {
                            title: 'Eleves',
                            modal: 'mdl-ask-tdb-eleve',
                            modal_title: 'TABLEAU DE BORD POUR LES ELEVES',
                            title_view: 'TABLEAU DE BORD POUR LES ELEVES',
                            view: 'tdb_ele',
                            icon: 'icon-eleve'
                            },
                            {
                            title: 'Candidats',
                            modal: 'mdl-ask-tdb-candidats',
                            modal_title: 'TABLEAU DE BORD POUR LES CANDIDATS',
                            title_view: 'TABLEAU DE BORD POUR LES CANDIDATS',
                            view: 'tdb_can',
                            icon: 'icon-candidat'
                            },
                        ],
                },
                {
                        title: 'Finance',
                        icon: 'icon-finance',
                        subItems: [
                            {
                            title: 'Frais fixe',
                            modal: 'mdl-ask-finance-frais-fixe',
                            modal_title: 'FRAIS FIXES',
                            title_view: 'FRAIS FIXES',
                            view: 'frais',
                            modalOff: 'plus',
                            icon: 'icon-finance-frais-fixe',
                            acces:'fin'
                            },
                            {
                            title: 'Ecolages et cantines',
                            modal: 'mdl-ask-finance-ecolage',
                            modal_title: 'ECOLAGES ET CANTINES',
                            title_view: 'ECOLAGES ET CANTINES',
                            view: 'eco',
                            modalOff: 'plus',
                            icon: 'icon-finance-ecolage',
                            acces:'fin'
                            },
                            {
                            title: 'Suivi paiement',
                            action: 'open_suivi_paiement',
                            title_view:'SUIVI DES PAIEMENTS',
                            view: 'suivi',
                            modalOff: 'plus',
                            icon: 'icon-frais-suivi',
                            acces:'fin'
                            },
                        ],
                },
                {
                        title: 'Eleves',
                        icon: 'icon-eleve',
                        subItems: [
                            {
                            title: 'Listes',
                            modal: 'mdl-ask-prom-liste-eleve',
                            modal_title: 'LISTE DES ELEVES',
                            title_view: 'INFORMATIONS GENERALES',
                            view: 'liste_eleve',
                            modalOff: 'plus',
                            icon: 'icon-liste',
                            acces:'ele'
                            },
                            {
                            title: 'Absence et retard',
                            action: 'open_absence_retard',
                            title_view:'ABSENCES ET RETARDS',
                            view: 'abs',
                            modalOff: 'plus',
                            icon: 'icon-abs-rtd',
                            acces:'ele'
                            },
                            {
                            title: 'Stage',
                            modal: 'mdl-ask-prom-stage-eleve',
                            modal_title: 'STAGE DES ELEVES',
                            title_view:'SUIVI DES STAGES',
                            view: 'stage',
                            modalOff: 'plus',
                            icon: 'icon-stage',
                            acces:'ele'
                            },
                            {
                            title: 'Post formation',
                            modal: 'mdl-ask-prom-post-eleve',
                            modal_title: 'POST FORMATION DES ELEVES',
                            title_view:'POST FORMATION DES ELEVES',
                            view: 'post',
                            modalOff: 'plus',
                            icon: 'icon-post',
                            acces:'ele'
                            },
                            {
                            title: 'promotion',
                            action: 'open_promotion_eleve',
                            title_view:'GESTION DES PROMOTIONS',
                            view: 'prom',
                            modalOff: 'plus',
                            icon: 'icon-prom',
                            acces:'ele'
                            },
                            {
                            title: 'Filière',
                            action: 'open_filiere',
                            title_view:'GESTION DES FILIERES',
                            view: 'fil',
                            modalOff: 'plus',
                            icon: 'icon-filiere',
                            acces:'ele'
                            },
                        ],
                },
                {
                        title: 'Candidats',
                        icon: 'icon-candidat',
                        subItems: [
                            {
                            title: 'Listes',
                            modal: 'mdl-ask-candidat-liste',
                            modal_title: 'LISTE DES CANDIDATS',
                            title_view: 'LISTE DES CANDIDATS',
                            view: 'can_list',
                            modalOff: 'plus',
                            isCandidate: true,
                            icon: 'icon-liste',
                            acces:'can'
                            },
                            {
                            title: 'Note',
                            modal: 'mdl-ask-candidat-note',
                            modal_title: 'NOTE DES CANDIDATS',
                            title_view: 'NOTE DES CANDIDATS',
                            view: 'can_note',
                            modalOff: 'plus',
                            isCandidate: true,
                            icon: 'icon-note',
                            acces:'can'
                            },
                            {
                            title: 'Année concours',
                            view: 'can_annee',
                            title_view: 'GESTION DES ANNÉES DE CONCOURS',
                            isCandidate: true,
                            icon: 'icon-annee',
                            acces:'can'
                            },
                        ],
                },
                {
                        title: 'Compte',
                        icon: 'icon-compte',
                        action: 'open_compte',
                        view: 'compte',
                },
                ],
            titre_contenu: 'BIENVENUE',
            selected:'',
            initialValue_annee: {
                annee: null,
            },
            annees: [],
            selected_prom: null,
            selected_annee: null,
            promotions: [],
        }
    },
    computed: {
        ...mapStores(useUserStore,useSubscribeStore,selectPromStore),
    },
    methods: {

        // fonction pour les vues
        menuId(title) {
            return `menu_${title.toLowerCase().replace(/\s+/g, '_')}`;
        },
        async changeClass(view, title, prom, promCan) {
            this.selected = view
            await this.getPromotions();
            await this.getAnnees();
            if(title){
                this.titre_contenu = title.toUpperCase();
            }
            this.selectProm(prom, promCan);
        },
        async logout(){
            await supabase.auth.signOut()
            this.$router.push('/')
        },
        selectProm(prom,promCan) {
            if(prom){
                this.selectPromStore.setSelectProm(prom);
            }
            if(promCan){
                this.selectPromStore.setSelectCanProm(promCan);
            }
        },
        //fonction pour les donnees
        async getPromotions() {
            try {
                const { data } = await supabase
                .from('mjg_promotion')
                .select('*')
                .order('id', { ascending: false });

                this.promotions = data || [];
            } catch (error) {
                console.error('Erreur lors de la récupération des promotions:', error);
                this.promotion = [];
            }
        },
        async getAnnees() {
            try {
                const { data } = await supabase
                .from('mjg_promc')
                .select('*')
                .order('id', { ascending: false });

                this.annees = data || [];
            } catch (error) {
                console.error('Erreur lors de la récupération des années:', error);
                this.annees = [];
            }
        },
    },

    async mounted() {
        
    },

    
}
</script>
<style>
@import '../css/dashboard.css';
@import '../css/navbar-menu.css';
@import '../css/_ref_icon.css';
@import '../css/_common_element.css';
@import '../css/_modal.css';
</style>
