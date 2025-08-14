<template>
    {{ userStore.edit }} {{ userStore.delet }} {{ showActions }}
        <div class="table-container">
        <table class="table table-striped">
            <thead class="table-header">
            <tr>
                <th  v-for="col in columns" :key="col.key" :style="col.style? col.style : ''">
                {{ col.label }}
                </th>
                <th v-if="showActions && (userStore.edit || userStore.delet)" style="min-width : 250px; text-align: center;">Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in rows" :key="item.id">
                <td  v-for="col in columns" :key="col.key" :class="col.etat? 'td-fixed':''"> 
                {{ item[col.key] }}
                </td>
                <td v-if="showActions && (userStore.edit || userStore.delet)">
                <slot name="actions" :item="item"></slot>
                </td>
            </tr>
            </tbody>
        </table>
        </div>
    </template>
    
    <script>
import { useUserStore } from '@/store/user';
import { mapStores } from 'pinia';

    export default {
        name: 'DataTable',
        props: {
            rows: {
                type: Array,
                required: true
            },
            columns: {
                type: Array,
                required: true
                // [{ key: 'name', label: 'Nom' }, { key: 'mdp', label: 'Mot de passe' }]
            },
            showActions: {
                type: Boolean,
                default: true
            }
        },
        computed:{
            ...mapStores(useUserStore),
        }
    }
    </script>
    