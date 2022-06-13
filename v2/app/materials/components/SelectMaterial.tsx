import { Listbox, Transition } from "@headlessui/react"
import { CheckIcon, PlusCircleIcon } from "@heroicons/react/outline"
import Dialog from "app/primitives/Dialog"
import { useInfiniteQuery, useMutation } from "blitz"
import { Fragment, useCallback, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import useOnClickOutside from "use-onclickoutside"
import useDebouncedValue from "../../hooks/useDebouncedValue"
import createMaterial from "../mutations/createMaterial"
import getMaterials from "../queries/getMaterials"

export interface SelectMaterialProps {
  selected?: any
  exclude?: string[]
  // eslint-disable-next-line no-unused-vars
  onChange: (selected: any) => any
}

function SelectMaterial(props: SelectMaterialProps) {
  const [keyword, setKeyword] = useState("")
  const [optionsIsOpen, setOptionsIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  useOnClickOutside(selectRef, () => setOptionsIsOpen(false))
  const debouncedKeyword = useDebouncedValue(keyword, 500)
  const [materialsPages] = useInfiniteQuery(
    getMaterials,
    (
      page = {
        take: 100,
        skip: 0,
        where: {
          name: { contains: debouncedKeyword, mode: "insensitive" },
          id: { notIn: props.exclude },
        },
      }
    ) => page,
    {
      getNextPageParam: (lastPage) => lastPage.nextPage,
      suspense: false,
    }
  )

  const [createMaterialMutation, { isLoading: createMaterialMutationIsLoading }] =
    useMutation(createMaterial)
  const [createMaterialDialogIsOpen, setCreateMaterialDialogIsOpen] = useState(false)
  const saveMaterialForm = useForm<{ name: string }>({
    // resolver: zodResolver(CreateMaterial),
  })

  const handleSaveMaterial = useCallback(
    (materialInput) => {
      createMaterialMutation(materialInput)
      setCreateMaterialDialogIsOpen(false)
    },
    [createMaterialMutation]
  )

  useEffect(() => {
    if (debouncedKeyword) {
      setOptionsIsOpen(true)
    }
  }, [debouncedKeyword])

  return (
    <>
      <Listbox value={props.selected} onChange={props.onChange}>
        <div className="relative mt-1 mb-3" ref={selectRef}>
          <div className="relative">
            <input
              className="py-1 px-2 w-full rounded-lg border"
              type="text"
              placeholder="搜尋材料"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onClick={() => setOptionsIsOpen(true)}
            />
            <PlusCircleIcon
              className="absolute top-0 right-2 w-5 h-5 hover:text-gray-700 transition transform translate-y-1/3 cursor-pointer"
              onClick={() => setCreateMaterialDialogIsOpen(true)}
            />
          </div>
          <Transition
            as={Fragment}
            show={optionsIsOpen}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              static
              className="overflow-auto absolute py-1 mt-1 w-full max-h-60 text-base sm:text-sm bg-white rounded-md ring-1 ring-black ring-opacity-5 shadow-lg focus:outline-none"
            >
              {materialsPages?.map((materialPage) => (
                <>
                  {materialPage.materials.map((material) => (
                    <Listbox.Option
                      key={material.id}
                      className={({ active }) =>
                        `${active ? "text-amber-900 bg-amber-100" : "text-gray-900"}
                          select-none relative py-2 pl-10 pr-4 transition-colors cursor-pointer hover:bg-yellow-100`
                      }
                      value={material.id}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`${selected ? "font-medium" : "font-normal"} block truncate`}
                          >
                            {material.name}
                          </span>
                          {selected ? (
                            <span
                              className={`${active ? "text-amber-600" : "text-amber-600"}
                                absolute inset-y-0 left-0 flex items-center pl-3`}
                            >
                              <CheckIcon className="w-5 h-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      <Dialog
        open={createMaterialDialogIsOpen}
        onClose={() => setCreateMaterialDialogIsOpen(false)}
      >
        <form onSubmit={saveMaterialForm.handleSubmit(handleSaveMaterial)}>
          <input
            {...saveMaterialForm.register("name")}
            placeholder="物料名稱"
            type="text"
            className="py-1 px-2 w-full rounded-lgborder"
          />

          <button
            className="p-2 mt-2 rounded-md border"
            type="submit"
            disabled={createMaterialMutationIsLoading}
          >
            {createMaterialMutationIsLoading ? "Saving..." : "Save"}
          </button>
        </form>
      </Dialog>
    </>
  )
}

export default SelectMaterial
