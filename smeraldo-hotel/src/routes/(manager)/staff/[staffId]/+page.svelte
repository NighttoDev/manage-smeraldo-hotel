<script lang="ts">
	import { superForm } from 'sveltekit-superforms';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let isDeactivating = $state(false);
	let showConfirmDialog = $state(false);

	// Capture initial form value — superForm manages its own reactive state from here
	const initialForm = data.form;
	const { form, errors, enhance, submitting, message } = superForm(initialForm);
</script>

<svelte:head>
	<title>Chỉnh sửa nhân viên — Smeraldo Hotel</title>
</svelte:head>

<div class="mx-auto max-w-lg px-4 py-6">
	<!-- Back link -->
	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<a
		href="/staff"
		class="mb-6 inline-flex items-center gap-1 font-sans text-sm text-primary hover:underline"
	>
		← Danh sách nhân viên
	</a>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->

	<h1 class="mb-6 font-sans text-xl font-bold text-high-contrast">
		Chỉnh sửa: {data.staff.full_name}
	</h1>

	<!-- Success message -->
	{#if $message?.type === 'success'}
		<div
			class="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
			role="alert"
		>
			{$message.text}
		</div>
	{/if}

	<!-- Error message -->
	{#if $message?.type === 'error'}
		<div
			class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
			role="alert"
		>
			{$message.text}
		</div>
	{/if}

	<!-- Edit Form -->
	<div class="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
		<form
			method="POST"
			action="?/updateStaff"
			use:enhance
			class="space-y-4"
		>
			<!-- Full Name -->
			<div>
				<label for="full_name" class="mb-1 block font-sans text-sm font-medium text-high-contrast">
					Họ và tên <span class="text-red-500">*</span>
				</label>
				<input
					id="full_name"
					name="full_name"
					type="text"
					required
					bind:value={$form.full_name}
					aria-invalid={$errors.full_name ? 'true' : undefined}
					class="w-full rounded-md border border-gray-300 px-3 py-2 font-sans text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
				/>
				{#if $errors.full_name}
					<p class="mt-1 font-sans text-xs text-red-600">{$errors.full_name}</p>
				{/if}
			</div>

			<!-- Role -->
			<div>
				<label for="role" class="mb-1 block font-sans text-sm font-medium text-high-contrast">
					Vai trò <span class="text-red-500">*</span>
				</label>
				<select
					id="role"
					name="role"
					required
					bind:value={$form.role}
					class="w-full rounded-md border border-gray-300 px-3 py-2 font-sans text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
				>
					<option value="manager">Quản lý</option>
					<option value="reception">Lễ tân</option>
					<option value="housekeeping">Dọn phòng</option>
				</select>
			</div>

			<!-- Active Status -->
			<div class="flex items-center gap-2">
				<input
					id="is_active"
					name="is_active"
					type="checkbox"
					bind:checked={$form.is_active}
					class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
				/>
				<label for="is_active" class="font-sans text-sm text-high-contrast">
					Tài khoản đang hoạt động
				</label>
			</div>

			<!-- Note about email/password -->
			<p class="font-sans text-xs text-gray-400">
				Email và mật khẩu được quản lý bởi hệ thống xác thực — không thể chỉnh sửa ở đây.
			</p>

			<!-- Save button -->
			<button
				type="submit"
				disabled={$submitting}
				class="min-h-[44px] w-full rounded-md bg-primary px-4 py-2 font-sans text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if $submitting}
					<span class="inline-flex items-center justify-center gap-2">
						<svg
							class="h-4 w-4 animate-spin"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Đang lưu...
					</span>
				{:else}
					Lưu thay đổi
				{/if}
			</button>
		</form>
	</div>

	<!-- Deactivate section (only shown for active accounts) -->
	{#if $form.is_active}
		<div class="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
			<h3 class="mb-2 font-sans text-sm font-semibold text-red-800">Vô hiệu hóa tài khoản</h3>
			<p class="mb-3 font-sans text-xs text-red-700">
				Nhân viên sẽ không thể đăng nhập sau khi bị vô hiệu hóa. Hành động này có thể hoàn tác bằng
				cách bật lại trạng thái "Hoạt động" ở trên.
			</p>
			<button
				type="button"
				onclick={() => (showConfirmDialog = true)}
				class="min-h-[44px] rounded-md border border-red-300 bg-white px-4 py-2 font-sans text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
			>
				Vô hiệu hóa tài khoản
			</button>
		</div>
	{/if}
</div>

<!-- Confirmation Dialog (modal overlay) -->
{#if showConfirmDialog}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
		role="dialog"
		aria-modal="true"
		aria-labelledby="dialog-title"
	>
		<div class="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
			<h2 id="dialog-title" class="mb-2 font-sans text-base font-semibold text-high-contrast">
				Vô hiệu hóa tài khoản?
			</h2>
			<p class="mb-5 font-sans text-sm text-gray-600">
				Vô hiệu hóa tài khoản của <strong>{data.staff.full_name}</strong>? Họ sẽ bị đăng xuất và không
				thể đăng nhập lại.
			</p>
			<div class="flex gap-3">
				<form
					method="POST"
					action="?/deactivateStaff"
					use:enhance
					class="flex-1"
				>
					<button
						type="submit"
						disabled={isDeactivating}
						class="min-h-[44px] w-full rounded-md bg-red-600 px-4 py-2 font-sans text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:opacity-50"
						onclick={() => (isDeactivating = true)}
					>
						{isDeactivating ? 'Đang xử lý...' : 'Xác nhận'}
					</button>
				</form>
				<button
					type="button"
					onclick={() => (showConfirmDialog = false)}
					class="min-h-[44px] flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 font-sans text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
				>
					Hủy
				</button>
			</div>
		</div>
	</div>
{/if}
