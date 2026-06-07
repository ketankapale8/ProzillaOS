<script setup lang="ts">
import { useData } from "vitepress";
import { computed } from "vue";

const { page } = useData();
const DEV_MODE = import.meta.env.DEV;
const isDraft = computed(() => DEV_MODE && page.value.frontmatter.draft)
</script>

<template>
	<div v-if="isDraft" class="draft-banner">
		This is a draft.
	</div>
</template>

<style scoped>
.draft-banner {
	color: var(--yellow-0);
	background: var(--yellow-2);
	padding: 1rem;
	margin: 0 0 1.5rem;
	border-radius: var(--border-radius-1);
	border-left: 5px solid var(--yellow-0);
	text-align: center;
	font-weight: 700;
	font-size: 1.5rem;
}
</style>