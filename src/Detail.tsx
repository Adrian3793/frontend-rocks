export const Detail = () => {
  return <div className="text-5xl space-x-2 space-y-2 flex flex-wrap justify-end">
    <Card title="01" />
    <Card title="02 " />
  </div>
};

const Card = (props: { title: string }) => {
  return <div className="bg-green-500 w-40 h-40 text-center flex items-center justify-center" title={props.title}>{props.title}</div>
}

