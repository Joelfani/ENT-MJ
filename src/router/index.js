import AnneeCandidat from '@/page/candidats/anneeCandidat.vue';
import ListeCandidat from '@/page/candidats/listeCandidat.vue';
import NoteCandidat from '@/page/candidats/noteCandidat.vue';
import ComptePage from '@/page/comptePage.vue';
import AbsenceEleve from '@/page/eleve/absenceEleve.vue';
import FiliereEleve from '@/page/eleve/filiereEleve.vue';
import ListeEleve from '@/page/eleve/listeEleve.vue';
import PostEleve from '@/page/eleve/postEleve.vue';
import PromotionEleve from '@/page/eleve/promotionEleve.vue';
import StageEleve from '@/page/eleve/stageEleve.vue';
import EcolageCantine from '@/page/finance/ecolageCantine.vue';
import FraisFixe from '@/page/finance/fraisFixe.vue';
import SuiviPage from '@/page/finance/suiviPage.vue';
import HomePage from '@/page/homePage.vue';
import LoginPage from '@/page/loginPage.vue';
import RegisterPage from '@/page/registerPage.vue';
import CandidatTdb from '@/page/tableau_de_bord/candidatTdb.vue';
import EleveTdb from '@/page/tableau_de_bord/eleveTdb.vue';
import FinancePage from '@/page/tableau_de_bord/financeTdb.vue';
import { useUserStore } from '@/store/user';
import { supabase } from '@/supabase';
import {createRouter, createWebHistory} from  'vue-router';


const routes = [
    {   path:'/', 
        name:'login',
        component:LoginPage
    },
    {   path:'/register', 
        name:'register',
        component:RegisterPage
    },
    {   
        path:'/HomePage', 
        name:'homePage',
        component:HomePage,
        children:[
            {
                path:'tdb_fin',
                component:FinancePage,
                meta: { requiresAuth: true, permission: 'fin' }
            },
            {
                path:'tdb_ele',
                component:EleveTdb,
                meta: { requiresAuth: true, permission: 'ele' }
            },
            {
                path:'tdb_can',
                component:CandidatTdb,
                meta: { requiresAuth: true, permission: 'can' }
            },
            {
                path:'frais',
                component:FraisFixe,
                meta: { requiresAuth: true, permission: 'fin' }
            },
            {
                path:'eco',
                component:EcolageCantine,
                meta: { requiresAuth: true, permission: 'fin' }
            },
            {
                path:'suivi',
                component:SuiviPage,
                meta: { requiresAuth: true, permission: 'fin' }
            },
            {
                path:'liste_eleve',
                component:ListeEleve,
                meta: { requiresAuth: true, permission: 'ele' }
            },
            {
                path:'abs',
                component:AbsenceEleve,
                meta: { requiresAuth: true, permission: 'ele' }
            },
            {
                path:'stage',
                component:StageEleve,
                meta: { requiresAuth: true, permission: 'ele' }
            },
            {
                path:'post',
                component:PostEleve,
                meta: { requiresAuth: true, permission: 'ele' }
            },
            {
                path:'prom',
                component:PromotionEleve,
                meta: { requiresAuth: true, permission: 'ele' }
            },
            {
                path:'fil',
                component:FiliereEleve,
                meta: { requiresAuth: true, permission: 'ele' }
            },
            {
                path:'can_list',
                component:ListeCandidat,
                meta: { requiresAuth: true, permission: 'can' }
            },
            {
                path:'can_note',
                component:NoteCandidat,
                meta: { requiresAuth: true, permission: 'can' }
            },
            {
                path:'can_annee',
                component:AnneeCandidat,
                meta: { requiresAuth: true, permission: 'can' }
            },
            {
                path:'compte',
                component:ComptePage,
            }

        ]
        
    }
];
const router = createRouter({
    //il faut changer ceci en createWebHashHistory  si en production local
    history: createWebHistory(),
    routes,
})

// Protection globale

//router.beforeEach => code a executer avant chaque changement de route
router.beforeEach(async (to, from, next) => {
    // Vérifier si l'utilisateur est en ligne
    // navigator.onLine => retourne true si l'utilisateur est en ligne, sinon false
    if (navigator.onLine) {
        const { data: { session },error } = await supabase.auth.getSession()
        // si une erreur est survenue lors de la récupération de la session
        if(error)
        {
            if (to.name !== 'login' && to.name !== 'register') {
                next({ name: 'login' }) // par sécurité, on redirige vers login
            } else {
                next() // on laisse passer pour login et register
            }
        }
        //si l'utilisateur n'est connecté
        else if (!session && to.name !== 'login' && to.name !== 'register') {
        // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
        next({ name:'login' })
        } 
        else {
            //remplir le store user si il n'est pas rempli
            const userStore = useUserStore()
            if(!userStore.user){
                //session?.user => Si session n'est pas null ni undefined, alors accède à session.user. Sinon, retourne undefined.
                if (session?.user) {
                    const { data: userData } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single()

                    if (userData) {
                        userStore.setUser(userData)
                    } 
                }
            }
            if(to.meta.requiresAuth) {
                if (userStore[to.meta.permission]) {
                    next() // L'utilisateur a la permission, on continue
                }
                else {
                    next({ name: 'homePage' }) // L'utilisateur n'a pas la permission, on le redirige
                }
            }else{
                next()
            }
        }
    }
    else{
        if (to.name !== 'login' && to.name !== 'register') {
            next({ name:'login' })
        }else{
            next()
        }
        
    }


})
export default router;