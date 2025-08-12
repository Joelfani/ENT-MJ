<template>
    <div class="_body">
    <div class="container_connexion">
        <div class="row the_row">
        <div class="col-6">
            <div class="col_intro_app">
            <div class="logo_app_container"></div>
            </div>
        </div>

        <div class="col-6">
            <div class="col_login">
            <div class="container">
                <span class="top_login">S'inscrire</span>

                <form class="form" @submit.prevent="send_register">
                <div class="form-cate">
                    <label for="ctg">Catégorie</label>
                    <select class="input_connexion" v-model="form.ctg">
                    <option
                        v-for="category in categories"
                        :key="category.id"
                        :value="category.id"
                    >
                        {{ category.name_ctg }}
                    </option>
                    </select>
                </div>
                
                    
                <div class="form-group">
                    <label>Email</label>
                    <input
                    type="email"
                    class="input_connexion"
                    placeholder="Entrer identifiant"
                    v-model="form.email"
                    />
                </div>

                <div class="form-group">
                    <label>NOM DE L'UTILISATEUR</label>
                    <input
                    type="TEXT"
                    class="input_connexion"
                    placeholder="Entrer un nom d'utilisateur"
                    v-model="form.nom"
                    />
                </div>

                <div class="form-group">
                    <label>Mot de passe</label>
                    <input
                    type="password"
                    class="input_connexion"
                    placeholder="Entrer mot de passe"
                    v-model="form.mdp"
                    />
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <button type="submit" class="btn btn-primary" :disabled="loading">S'inscrire</button>
                    <RouterLink to="/" type="button" class="btn btn-light" style="border: solid 1px gray;">Se connecter</RouterLink>
                </div>
                <p class="erreur">{{ erreur }}</p>

                
                </form>
            </div>
            </div>
        </div>
        </div>
    </div>
    </div>
</template>

<script>
import { supabase } from '@/supabase';
import { RouterLink } from 'vue-router';
export default {
    name: "LoginPage",
    components: {
    RouterLink
    },
    data() {
    return {
        email: "",
        mdp: "",
        ctg: "",
        erreur: "",
        categories: [],
        loading: false,
        form: {
        email: '',
        nom: '',
        mdp: '',
        ctg: '2',
        },
    };
    },
    methods: {
    async getCategories() {
    const { data, error } = await supabase
        .from('list_ctg')
        .select('*')

    if (error) {
        console.error('Erreur chargement catégories :', error.message)
    } else {
        this.categories = data.filter(category => category.id !== 1);
    }
    
    },
    async send_register() {
        this.loading = true
        const verifie_user = await supabase.from('users').select('email').eq('email', this.form.email).single()
        if(verifie_user.data){
            alert('Cet e-mail est déjà utilisé par un autre utilisateur !')
            this.loading = false
        }else{
            try {
        // Enregistrer l'utilisateur dans auth.users
        const { data, error: authError } = await supabase.auth.signUp({
            email: this.form.email,
            password: this.form.mdp,
        })

        if (authError) throw authError
        const user = data.user // récupérer l'id de l'utilisateur

        
        // Modifier l'utilisateur correspondant dans public.users
        const { error: updateError } = await supabase
            .from('users')
            .update({
            id_ctg: parseInt(this.form.ctg),
            name_user: this.form.nom,
            })
            .eq('id', user.id)

        if (updateError) throw updateError

        alert('Utilisateur ajouté avec succès!')
        this.$router.push('/')
        this.resetForm()
        } 
        catch (error) {
        console.error('Error adding user:', error)
        
        if (error.code === 'weak_password') {
            alert('Le mot de passe doit contenir au moins 6 caractères !')
        }
        else if (error.code === 'email_address_invalid') {
            alert('L\'adresse email est invalide !')
        }
        else {
            alert('Erreur lors de l\'ajout de l\'utilisateur!')
        }
        } finally {
        this.loading = false
        }
        }
        
    },
    resetForm() {
        this.form = {
        email: '',
        nom: '',
        mdp: '',
        ctg: '2',
        fin: false,
        ele: false,
        can: false,
        ajo: false,
        mod: false,
        del: false
        }
    }
    },
    async mounted() {
    setInterval(async () => {
        if (!navigator.onLine) {
        alert('Vous êtes hors ligne! Veuillez vous connecter à internet et rafraichir la page')
        }
    },1000)
    if(navigator.onLine){
        await this.getCategories()
    }
}
};
</script>

<style scoped>
@import "../css/index.css";
@import "../css/_common_element.css";
</style>