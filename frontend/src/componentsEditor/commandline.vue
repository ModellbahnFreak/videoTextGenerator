<script setup lang="ts">

</script>

<template>
    <v-card-text>
        <v-row>
            <v-col>
                <v-text-field label="Command" variant="underlined" :hide-details="true"></v-text-field>
            </v-col>
            <v-col cols="1"><v-btn prepend-icon="mdi-send">Exec</v-btn></v-col>
        </v-row>
    </v-card-text>
</template>