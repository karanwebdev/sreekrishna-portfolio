import S from "@sanity/desk-tool/structure-builder";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import { IoSettingsSharp, IoCallSharp, IoListSharp, IoPersonCircleSharp } from "react-icons/io5";

export default () =>
  S.list()
    .title("Manage Content")
    .items([
      S.listItem()
        .title("Settings")
        .icon(IoSettingsSharp)
        .child(S.document().schemaType("seo").documentId("seo")),

      S.listItem()
        .title("Contact")
        .icon(IoCallSharp)
        .child(S.document().schemaType("contact").documentId("contact")),

      S.divider(),

      orderableDocumentListDeskItem({
        type: "case",
        title: "Cases",
        icon: IoListSharp
      }),

      S.listItem()
        .title("About")
        .icon(IoPersonCircleSharp)
        .child(S.document().schemaType("about").documentId("about")),

      // ...S.documentTypeListItems().filter(
      //   (listItem) =>
      //     ![
      //       "seo",
      //       "contact",
      //       "about",
      //       "post",
      //       "products",
      //     ].includes(listItem.getId())
      // ),
    ]);
