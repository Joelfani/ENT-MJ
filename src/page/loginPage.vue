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
              <span class="top_login">Se connecter</span>

              <form class="form" @submit.prevent="send_connexion">
                <div class="form-cate">
                  <label for="ctg">Catégorie</label>
                  <select class="input_connexion" v-model="ctg">
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
                    v-model="email"
                  />
                </div>

                <div class="form-group">
                  <label>Mot de passe</label>
                  <input
                    type="password"
                    class="input_connexion"
                    placeholder="Entrer mot de passe"
                    v-model="mdp"
                  />
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <button type="submit" class="btn btn_login">Connexion</button>
                  <RouterLink to="/register" type="button" class="btn btn-light" style="border: solid 1px gray;">S'inscrire</RouterLink>
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
import { useUserStore } from '@/store/user';
import { supabase } from '@/supabase';
import { RouterLink } from 'vue-router';
export default {
  name: "registerPage",
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
      this.categories = data 
    }
    
  },
  async send_connexion() {
          if (navigator.onLine) {
            this.erreur = ""; // Reset erreur précédente

          // Vérifier les champs obligatoires
          if (!this.email || !this.mdp || !this.ctg) {
            this.erreur = "Veuillez remplir tous les champs.";
            return;
          }

          try {
            // Vérifier la catégorie liée à l'email
            const { data: data_id_ctg, error: error_ctg } = await supabase
              .from('users')
              .select('id_ctg,activer')
              .eq('email', this.email)
              .eq('mjg', true)
              .single();

            if (error_ctg || !data_id_ctg) {
              this.erreur = "Aucun compte trouvé pour cet e-mail.";
              return;
            }

            if (data_id_ctg.id_ctg !== this.ctg) {
              this.erreur = "Catégorie incorrecte pour cet utilisateur.";
              return;
            }

            if (data_id_ctg.activer === false) {
              this.erreur = "Votre compte n'est pas activé. Veuillez contacter l'administrateur.";
              return;
            }

            // Connexion
            const { error: authError } = await supabase.auth.signInWithPassword({
              email: this.email,
              password: this.mdp
            });

            if (authError) {
              if (authError.message === "Invalid login credentials") {
                this.erreur = "Adresse e-mail ou mot de passe incorrect.";
              } 
              else if (authError.message === "Email not confirmed") {
                this.erreur = "Veuillez confirmer votre adresse e-mail avant de vous connecter.";
              }
              else {
                this.erreur = "Une erreur inattendue s'est produite. Veuillez réessayer.";
              }
              return;
            }

            // Connexion réussie

            this.erreur = ""; // efface les messages d’erreur
            const userStore = useUserStore()

            //recuperation des infos de l'utilisateur
            const { data: userData } = await supabase
              .from('users')
              .select('*')
              .eq('email', this.email)
              .single();

              if(userData){
                userStore.setUser(userData)
              } 

            this.$router.push("/HomePage");

          } catch (err) {
            console.error("Erreur inattendue :", err);
            this.erreur = "Une erreur inattendue s'est produite. Veuillez réessayer.";
          }
          }
          else{
            alert('Vous etes hors ligne! Veuillez vous connecter a internet')
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