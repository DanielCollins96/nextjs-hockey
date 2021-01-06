import { useMemo } from 'react';
import { useTable } from 'react-table';
import Table from '../components/Table';
import s from './chart.module.css';
import makeData from '../components/makeData';


export default function Chart() {

 const columns = useMemo(
    () => [
      {
        Header: 'Name',
        columns: [
          {
            Header: 'First Name',
            accessor: 'firstName',
          },
          {
            Header: 'Last Name',
            accessor: 'lastName',
          },
        ],
      },
      {
        Header: 'Info',
        columns: [
          {
            Header: 'Age',
            accessor: 'age',
          },
          {
            Header: 'Visits',
            accessor: 'visits',
          },
          {
            Header: 'Status',
            accessor: 'status',
          },
          {
            Header: 'Profile Progress',
            accessor: 'progress',
          },
        ],
      },
    ],
    []
  )
  const data = useMemo(() => makeData(20), [])

    return (
        <div className={s.content}>
            hey
            <Table columns={columns} data={data} />
        </div>
    )
}




