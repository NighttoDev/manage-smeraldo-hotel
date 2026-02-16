<script lang="ts">
	interface Props {
		value: string;
		error?: string | string[];
		placeholder?: string;
		id?: string;
	}

	let { value = $bindable(''), error, placeholder = 'Nhập tên khách', id = 'guest_name' }: Props =
		$props();

	let errorText = $derived(Array.isArray(error) ? error[0] : error);
</script>

<div class="flex flex-col gap-1">
	<label for={id} class="font-sans text-sm font-medium text-gray-700">
		Tên khách <span class="text-red-500" aria-hidden="true">*</span>
	</label>
	<input
		{id}
		name={id}
		type="text"
		bind:value
		{placeholder}
		autocomplete="off"
		aria-required="true"
		aria-describedby={errorText ? `${id}-error` : undefined}
		aria-invalid={!!errorText}
		class="h-12 rounded-lg border px-3 py-3 font-sans text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 motion-reduce:transition-none
		{errorText
			? 'border-red-400 focus:ring-red-300'
			: 'border-gray-300 focus:ring-primary/40'}"
	/>
	{#if errorText}
		<p id="{id}-error" class="font-sans text-xs text-red-600" role="alert">{errorText}</p>
	{/if}
</div>
