import IconBtn from "./IconBtn"

export default function ConfirmationModal({ modalData }) {
  return (
    <div className="fixed inset-0 z-[1000] !mt-0 grid place-items-center overflow-auto bg-ink-900/70 backdrop-blur-sm">
      <div className="w-11/12 max-w-[380px] rounded-2xl border border-ink-600 bg-ink-800 p-7 shadow-2xl shadow-black/40">
        <p className="font-serif text-2xl font-semibold text-ink-50">
          {modalData?.text1}
        </p>
        <p className="mb-6 mt-3 leading-6 text-ink-200">{modalData?.text2}</p>
        <div className="flex items-center gap-x-3">
          <IconBtn onclick={modalData?.btn1Handler} text={modalData?.btn1Text} />
          <button
            className="cursor-pointer rounded-lg border border-ink-600 bg-transparent px-5 py-2 font-semibold text-ink-100 transition-colors duration-150 hover:border-sage-500 hover:text-sage-500"
            onClick={modalData?.btn2Handler}
          >
            {modalData?.btn2Text}
          </button>
        </div>
      </div>
    </div>
  )
}