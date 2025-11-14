import { BiWorld } from 'react-icons/bi';
import { FaHammer } from 'react-icons/fa6';
import { HiMiniReceiptRefund } from 'react-icons/hi2';
import { MdLocalShipping } from 'react-icons/md';

export const FeatureGrid = () => {
	return (
		<div className='-mt-12 mb-8'>
			<div className='bg-white rounded-lg shadow-2xl grid grid-cols-2 gap-8 p-6 lg:grid-cols-4 lg:gap-5'>
				<div className='flex items-center gap-4'>
					<MdLocalShipping size={40} className='text-cyan-600' />

					<div className='space-y-1'>
						<p className='font-semibold text-gray-900'>Envío gratis</p>
						<p className='text-sm text-gray-600'>En todos nuestros productos</p>
					</div>
				</div>

				<div className='flex items-center gap-4'>
					<HiMiniReceiptRefund size={40} className='text-cyan-600' />

					<div className='space-y-1'>
						<p className='font-semibold text-gray-900'>Devoluciones</p>
						<p className='text-sm text-gray-600'>
							Devuelve el equipo si no te satisface la compra dentro de
							72 horas
						</p>
					</div>
				</div>

				<div className='flex items-center gap-4'>
					<FaHammer size={40} className='text-cyan-600' />

					<div className='space-y-1'>
						<p className='font-semibold text-gray-900'>Soporte 24/7</p>
						<p className='text-sm text-gray-600'>
							Soporte técnico en cualquier momento
						</p>
					</div>
				</div>

				<div className='flex items-center gap-4'>
					<BiWorld size={40} className='text-cyan-600' />

					<div className='space-y-1'>
						<p className='font-semibold text-gray-900'>Garantía</p>
						<p className='text-sm text-gray-600'>
							Garantía de 1 año en todos los equipos
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};